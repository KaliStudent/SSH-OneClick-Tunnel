import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('sshWorkbench', {
  profiles: { list: () => ipcRenderer.invoke('profiles:list'), upsert: (p: any) => ipcRenderer.invoke('profiles:upsert', p), delete: (id: string) => ipcRenderer.invoke('profiles:delete', id) },
  ssh: { connect: (id: string) => ipcRenderer.invoke('ssh:connect', id), disconnect: (id: string) => ipcRenderer.invoke('ssh:disconnect', id), status: (id: string) => ipcRenderer.invoke('ssh:status', id) },
  shell: {
    open: (pid: string, cols: number, rows: number) => ipcRenderer.invoke('shell:open', pid, cols, rows) as Promise<string>,
    write: (sid: string, data: string) => ipcRenderer.invoke('shell:write', sid, data),
    resize: (sid: string, cols: number, rows: number) => ipcRenderer.invoke('shell:resize', sid, cols, rows),
    close: (sid: string) => ipcRenderer.invoke('shell:close', sid),
    onData: (cb: (sid: string, data: string) => void) => { ipcRenderer.on('shell:data', (_: any, sid: string, data: string) => cb(sid, data)); },
    onClosed: (cb: (sid: string) => void) => { ipcRenderer.on('shell:closed', (_: any, sid: string) => cb(sid)); },
  },
  tunnels: { create: (pid: string, spec: any) => ipcRenderer.invoke('tunnels:create', pid, spec), list: (pid: string) => ipcRenderer.invoke('tunnels:list', pid), close: (pid: string, tid: string) => ipcRenderer.invoke('tunnels:close', pid, tid) },
  services: { openRdp: (pid: string, h: string) => ipcRenderer.invoke('services:openRdp', pid, h), openWeb: (pid: string, h: string, tp: number, ob: boolean) => ipcRenderer.invoke('services:openWeb', pid, h, tp, ob) },
  hostkey: { onVerify: (cb: (d: any) => void) => { ipcRenderer.on('hostkey:verify', (_: any, d: any) => cb(d)); }, respond: (pid: string, ok: boolean) => { ipcRenderer.send(`hostkey:response:${pid}`, ok); } },
  notes: { load: (pid: string) => ipcRenderer.invoke('notes:load', pid) as Promise<string>, save: (pid: string, c: string) => ipcRenderer.invoke('notes:save', pid, c) },
});
