export type Profile = { id: string; name: string; host: string; port: number; username: string; auth: { type: 'password'; password: string } | { type: 'privateKey'; privateKey: string; passphrase?: string } };
export type TunnelSpec = { kind: 'local' | 'socks'; name: string; remoteHost?: string; remotePort?: number; bindHost?: string; requestedLocalPort?: number; disposable?: boolean; idleTimeoutMs?: number };
export type TunnelInfo = { id: string; name: string; kind: 'local' | 'socks'; bindHost: string; localPort: number; remoteHost?: string; remotePort?: number; disposable: boolean; createdAt: number; lastActiveAt: number; bytesIn: number; bytesOut: number; status: 'active' | 'closing' | 'closed' | 'error'; error?: string; explain?: string };
export type HostKeyEvent = { profileId: string; host: string; hashAlgo: string; fingerprint: string; known: string | null; changed: boolean };
declare global {
  interface Window {
    sshWorkbench: {
      profiles: { list: () => Promise<Profile[]>; upsert: (p: Profile) => Promise<Profile[]>; delete: (id: string) => Promise<Profile[]> };
      ssh: { connect: (id: string) => Promise<{ ok: true }>; disconnect: (id: string) => Promise<boolean>; status: (id: string) => Promise<{ connected: boolean; lastError?: string }> };
      shell: { open: (pid: string, cols: number, rows: number) => Promise<string>; write: (sid: string, data: string) => Promise<any>; resize: (sid: string, cols: number, rows: number) => Promise<any>; close: (sid: string) => Promise<any>; onData: (cb: (sid: string, data: string) => void) => void; onClosed: (cb: (sid: string) => void) => void };
      tunnels: { create: (pid: string, spec: TunnelSpec) => Promise<TunnelInfo>; list: (pid: string) => Promise<TunnelInfo[]>; close: (pid: string, tid: string) => Promise<boolean> };
      services: { openRdp: (pid: string, h: string) => Promise<TunnelInfo>; openWeb: (pid: string, h: string, tp: number, ob: boolean) => Promise<{ tunnel: TunnelInfo; url: string }> };
      hostkey: { onVerify: (cb: (d: HostKeyEvent) => void) => void; respond: (pid: string, ok: boolean) => void };
      notes: { load: (pid: string) => Promise<string>; save: (pid: string, c: string) => Promise<any> };
    }
  }
}
export {};
