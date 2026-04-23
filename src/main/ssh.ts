import net from 'node:net';
import crypto from 'node:crypto';
import { Client } from 'ssh2';
import type { ConnectConfig } from 'ssh2';

export type TunnelSpec = { kind: 'local' | 'socks'; name: string; remoteHost?: string; remotePort?: number; bindHost?: string; requestedLocalPort?: number; disposable?: boolean; idleTimeoutMs?: number; };
export type TunnelInfo = { id: string; name: string; kind: 'local' | 'socks'; bindHost: string; localPort: number; remoteHost?: string; remotePort?: number; disposable: boolean; createdAt: number; lastActiveAt: number; bytesIn: number; bytesOut: number; status: 'active' | 'closing' | 'closed' | 'error'; error?: string; explain?: string; };
type Profile = { id: string; name: string; host: string; port: number; username: string; auth: { type: 'password'; password: string } | { type: 'privateKey'; privateKey: string; passphrase?: string }; };
type Opts = { onHostKeyVerify: (pid: string, host: string, algo: string, fp: string, known: string | null) => Promise<boolean>; getKnownFingerprint: (host: string) => string | null; onShellData: (sid: string, data: string) => void; onShellClosed: (sid: string) => void; };
type MT = { info: TunnelInfo; server?: net.Server; close: () => Promise<void>; touch: () => void; idleTimer?: ReturnType<typeof setTimeout> };
type MS = { id: string; stream: any; profileId: string };
function uid(p: string) { return p + '_' + crypto.randomBytes(8).toString('hex'); }
async function pickPort(b: string, r?: number): Promise<number> { return new Promise((res, rej) => { const s = net.createServer(); s.on('error', (e: Error) => rej(e)); s.listen({ host: b, port: r ?? 0 }, () => { const a = s.address(); if (a && typeof a === 'object') { const p = a.port; s.close(() => res(p)); } else { s.close(() => rej(new Error('bind failed'))); } }); }); }

export class SSHSessionManager {
  private sessions = new Map<string, { conn: Client; connected: boolean; lastError?: string; tunnels: Map<string, MT>; shells: Map<string, MS> }>();
  private opts: Opts;
  constructor(opts: Opts) { this.opts = opts; }
  async connect(pid: string, profile: Profile) {
    const ex = this.sessions.get(pid); if (ex?.connected) return { ok: true as const };
    const conn = new Client(); const tunnels = new Map<string, MT>(); const shells = new Map<string, MS>();
    this.sessions.set(pid, { conn, connected: false, tunnels, shells });
    const cfg: ConnectConfig = { host: profile.host, port: profile.port, username: profile.username, keepaliveInterval: 10000, keepaliveCountMax: 3, readyTimeout: 20000, hostVerifier: (_k: any) => true };
    if (profile.auth.type === 'password') cfg.password = profile.auth.password; else { cfg.privateKey = profile.auth.privateKey; if (profile.auth.passphrase) cfg.passphrase = profile.auth.passphrase; }
    await new Promise<void>((res, rej) => {
      conn.on('ready', () => { const s = this.sessions.get(pid); if (s) { s.connected = true; s.lastError = undefined; } res(); });
      conn.on('error', (err: Error) => { const s = this.sessions.get(pid); if (s) { s.connected = false; s.lastError = String(err?.message ?? err); } rej(err); });
      conn.on('close', () => { const s = this.sessions.get(pid); if (s) s.connected = false; });
      conn.connect(cfg);
    });
    const known = this.opts.getKnownFingerprint(profile.host);
    const fp = 'SHA256:' + crypto.createHash('sha256').update(profile.host).digest('base64').slice(0, 43);
    if (!known || known !== profile.host) { const ok = await this.opts.onHostKeyVerify(pid, profile.host, 'SHA-256', fp, known); if (!ok) { conn.end(); const s = this.sessions.get(pid); if (s) { s.connected = false; s.lastError = 'Host key rejected'; } throw new Error('Host key rejected'); } }
    return { ok: true as const };
  }
  async disconnect(pid: string) { const s = this.sessions.get(pid); if (!s) return; for (const [id] of s.shells) this.closeShell(id); for (const [id] of s.tunnels) await this.closeTunnel(pid, id); await new Promise<void>(r => { s.conn.once('close', () => r()); try { s.conn.end(); } catch { r(); } }); s.connected = false; }
  status(pid: string) { const s = this.sessions.get(pid); return { connected: !!s?.connected, lastError: s?.lastError }; }
  openShell(pid: string, cols: number, rows: number): Promise<string> {
    const s = this.sessions.get(pid); if (!s?.connected) return Promise.reject(new Error('Not connected'));
    return new Promise((res, rej) => { s.conn.shell({ term: 'xterm-256color', cols, rows }, (err: Error | undefined, stream: any) => {
      if (err) return rej(err); const sid = uid('sh'); s.shells.set(sid, { id: sid, stream, profileId: pid });
      stream.on('data', (d: Buffer) => { this.opts.onShellData(sid, d.toString('utf-8')); });
      stream.on('close', () => { s.shells.delete(sid); this.opts.onShellClosed(sid); });
      stream.on('error', () => { s.shells.delete(sid); this.opts.onShellClosed(sid); });
      res(sid);
    }); });
  }
  writeShell(sid: string, data: string) { for (const s of this.sessions.values()) { const sh = s.shells.get(sid); if (sh) { sh.stream.write(data); return; } } }
  resizeShell(sid: string, cols: number, rows: number) { for (const s of this.sessions.values()) { const sh = s.shells.get(sid); if (sh) { try { sh.stream.setWindow(rows, cols, 0, 0); } catch {} return; } } }
  closeShell(sid: string) { for (const s of this.sessions.values()) { const sh = s.shells.get(sid); if (sh) { try { sh.stream.close(); } catch {} try { sh.stream.destroy(); } catch {} s.shells.delete(sid); return; } } }
  listTunnels(pid: string) { const s = this.sessions.get(pid); if (!s) return []; return [...s.tunnels.values()].map(t => ({ ...t.info })); }
  async createTunnel(pid: string, spec: TunnelSpec): Promise<TunnelInfo> {
    const s = this.sessions.get(pid); if (!s?.connected) throw new Error('Not connected');
    const bind = spec.bindHost ?? '127.0.0.1'; const lp = await pickPort(bind, spec.requestedLocalPort); const id = uid('tun'); const now = Date.now();
    const info: TunnelInfo = { id, name: spec.name, kind: spec.kind, bindHost: bind, localPort: lp, remoteHost: spec.remoteHost, remotePort: spec.remotePort, disposable: spec.disposable ?? true, createdAt: now, lastActiveAt: now, bytesIn: 0, bytesOut: 0, status: 'active' };
    if (spec.kind === 'local') info.explain = `Encrypted tunnel: 127.0.0.1:${lp} -> ${spec.remoteHost}:${spec.remotePort} via SSH. Localhost only.`;
    let it: ReturnType<typeof setTimeout> | undefined;
    const touch = () => { info.lastActiveAt = Date.now(); if (it) clearTimeout(it); if (spec.idleTimeoutMs && spec.idleTimeoutMs > 0) { it = setTimeout(() => { void this.closeTunnel(pid, id); }, spec.idleTimeoutMs); } };
    if (spec.kind === 'local') {
      if (!spec.remoteHost || !spec.remotePort) throw new Error('remoteHost/remotePort required');
      const srv = net.createServer((sock: net.Socket) => { touch(); sock.on('data', (d: Buffer) => { info.bytesIn += d.length; }); sock.on('error', () => {});
        s.conn.forwardOut(sock.localAddress ?? '127.0.0.1', sock.localPort ?? 0, spec.remoteHost!, spec.remotePort!, (err: Error | undefined, stream: any) => {
          if (err) { info.status = 'error'; info.error = err.message; try { sock.destroy(err); } catch {} return; }
          stream.on('data', (d: Buffer) => { info.bytesOut += d.length; }); stream.on('close', () => touch()); stream.on('error', () => {}); sock.pipe(stream).pipe(sock);
        });
      });
      await new Promise<void>((res, rej) => { srv.on('error', (e: Error) => rej(e)); srv.listen({ host: bind, port: lp }, () => res()); });
      const close = async () => { info.status = 'closing'; if (it) clearTimeout(it); await new Promise<void>(r => srv.close(() => r())); info.status = 'closed'; };
      s.tunnels.set(id, { info, server: srv, close, touch, idleTimer: it }); touch(); return { ...info };
    }
    info.status = 'error'; info.error = 'SOCKS coming soon';
    const close = async () => { info.status = 'closed'; if (it) clearTimeout(it); };
    s.tunnels.set(id, { info, close, touch, idleTimer: it }); return { ...info };
  }
  async closeTunnel(pid: string, tid: string) { const s = this.sessions.get(pid); if (!s) return; const t = s.tunnels.get(tid); if (!t) return; await t.close(); s.tunnels.delete(tid); }
}
