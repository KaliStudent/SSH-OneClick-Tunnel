import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import Store from 'electron-store';
import { SSHSessionManager } from './ssh';
import { launchRdp } from './rdp';
import { z } from 'zod';
const isDev = !app.isPackaged;
type Profile = { id: string; name: string; host: string; port: number; username: string; auth: { type: 'password'; password: string } | { type: 'privateKey'; privateKey: string; passphrase?: string } };
const store = new Store<{ profiles: Profile[]; trustedKeys: Record<string, string>; notes: Record<string, string> }>({ name: 'ssh-workbench' });
let mainWin: BrowserWindow | null = null;
const mgr = new SSHSessionManager({
  onHostKeyVerify: async (pid, host, algo, fp, known) => { if (!mainWin) return false; return new Promise<boolean>(res => { mainWin!.webContents.send('hostkey:verify', { profileId: pid, host, hashAlgo: algo, fingerprint: fp, known: known ?? null, changed: !!known && known !== fp }); ipcMain.once(`hostkey:response:${pid}`, (_: any, ok: boolean) => { if (ok) { const k = store.get('trustedKeys', {}); k[host] = fp; store.set('trustedKeys', k); } res(ok); }); }); },
  getKnownFingerprint: (h) => { const k = store.get('trustedKeys', {}); return k[h] ?? null; },
  onShellData: (sid, data) => { if (mainWin) mainWin.webContents.send('shell:data', sid, data); },
  onShellClosed: (sid) => { if (mainWin) mainWin.webContents.send('shell:closed', sid); },
});
function createWindow() {
  mainWin = new BrowserWindow({ width: 1280, height: 800, minWidth: 1024, minHeight: 640, backgroundColor: '#0f0f1a', webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }, title: 'SSH Workbench' });
  if (isDev) { mainWin.loadURL('http://localhost:5173'); mainWin.webContents.openDevTools({ mode: 'detach' }); } else mainWin.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'));
  mainWin.webContents.setWindowOpenHandler(({ url }: { url: string }) => { shell.openExternal(url); return { action: 'deny' as const }; });
  mainWin.on('closed', () => { mainWin = null; });
}
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
const pS = z.object({ id: z.string(), name: z.string(), host: z.string(), port: z.number().int().min(1).max(65535), username: z.string(), auth: z.union([z.object({ type: z.literal('password'), password: z.string() }), z.object({ type: z.literal('privateKey'), privateKey: z.string(), passphrase: z.string().optional() })]) });
const tS = z.object({ kind: z.enum(['local', 'socks']), name: z.string(), remoteHost: z.string().optional(), remotePort: z.number().int().min(1).max(65535).optional(), bindHost: z.string().optional(), requestedLocalPort: z.number().int().min(0).max(65535).optional(), disposable: z.boolean().default(true), idleTimeoutMs: z.number().int().min(0).optional() });
ipcMain.handle('profiles:list', async () => store.get('profiles', []));
ipcMain.handle('profiles:upsert', async (_: any, p: unknown) => { const pr = pS.parse(p); const ps = store.get('profiles', []) as Profile[]; const i = ps.findIndex(x => x.id === pr.id); if (i >= 0) ps[i] = pr; else ps.push(pr); store.set('profiles', ps); return ps; });
ipcMain.handle('profiles:delete', async (_: any, id: string) => { store.set('profiles', (store.get('profiles', []) as Profile[]).filter(p => p.id !== id)); return store.get('profiles', []); });
ipcMain.handle('ssh:connect', async (_: any, pid: string) => { const ps = store.get('profiles', []) as Profile[]; const p = ps.find(x => x.id === pid); if (!p) throw new Error('Not found'); return await mgr.connect(pid, p); });
ipcMain.handle('ssh:disconnect', async (_: any, pid: string) => { await mgr.disconnect(pid); return true; });
ipcMain.handle('ssh:status', async (_: any, pid: string) => mgr.status(pid));
ipcMain.handle('shell:open', async (_: any, pid: string, cols: number, rows: number) => await mgr.openShell(pid, cols, rows));
ipcMain.handle('shell:write', async (_: any, sid: string, data: string) => { mgr.writeShell(sid, data); return true; });
ipcMain.handle('shell:resize', async (_: any, sid: string, cols: number, rows: number) => { mgr.resizeShell(sid, cols, rows); return true; });
ipcMain.handle('shell:close', async (_: any, sid: string) => { mgr.closeShell(sid); return true; });
ipcMain.handle('tunnels:create', async (_: any, pid: string, spec: unknown) => await mgr.createTunnel(pid, tS.parse(spec) as any));
ipcMain.handle('tunnels:list', async (_: any, pid: string) => mgr.listTunnels(pid));
ipcMain.handle('tunnels:close', async (_: any, pid: string, tid: string) => { await mgr.closeTunnel(pid, tid); return true; });
ipcMain.handle('services:openRdp', async (_: any, pid: string, h: string) => { const t = await mgr.createTunnel(pid, { kind: 'local', name: `RDP -> ${h}`, remoteHost: h, remotePort: 3389, bindHost: '127.0.0.1', disposable: true, idleTimeoutMs: 7200000 }); await launchRdp({ host: '127.0.0.1', port: t.localPort }); return t; });
ipcMain.handle('services:openWeb', async (_: any, pid: string, h: string, tp: number, ob: boolean) => { const t = await mgr.createTunnel(pid, { kind: 'local', name: `Web -> ${h}:${tp}`, remoteHost: h, remotePort: tp, bindHost: '127.0.0.1', disposable: true, idleTimeoutMs: 3600000 }); const url = `http://127.0.0.1:${t.localPort}/`; if (ob) await shell.openExternal(url); return { tunnel: t, url }; });
ipcMain.handle('notes:load', async (_: any, pid: string) => { const n = store.get('notes', {}) as Record<string, string>; return n[pid] ?? ''; });
ipcMain.handle('notes:save', async (_: any, pid: string, c: string) => { const n = store.get('notes', {}) as Record<string, string>; n[pid] = c; store.set('notes', n); return true; });
