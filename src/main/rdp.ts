import { spawn } from 'node:child_process';
export async function launchRdp(opts: { host: string; port: number }) {
  await new Promise<void>((resolve, reject) => { const p = spawn('mstsc', [`/v:${opts.host}:${opts.port}`], { windowsHide: true, detached: true }); p.unref(); p.on('error', (e: Error) => reject(e)); setTimeout(() => resolve(), 300); });
}
