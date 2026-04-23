import { useState, useEffect, useCallback, useRef } from 'react';
export function useSSH(aid: string) {
  const [conn, setConn] = useState(false); const [err, setErr] = useState<string | undefined>(); const [cing, setCing] = useState(false); const r = useRef(aid); r.current = aid;
  useEffect(() => { if (!aid) { setConn(false); setErr(undefined); return; } let a = true; const p = async () => { try { const s = await window.sshWorkbench.ssh.status(aid); if (a && r.current === aid) { setConn(s.connected); if (s.lastError) setErr(s.lastError); } } catch {} }; void p(); const t = setInterval(p, 1000); return () => { a = false; clearInterval(t); }; }, [aid]);
  const connect = useCallback(async () => { if (!aid) return; setCing(true); setErr(undefined); try { await window.sshWorkbench.ssh.connect(aid); setConn(true); } catch (e: any) { setErr(String(e?.message ?? e)); } finally { setCing(false); } }, [aid]);
  const disconnect = useCallback(async () => { if (!aid) return; try { await window.sshWorkbench.ssh.disconnect(aid); setConn(false); } catch (e: any) { setErr(String(e?.message ?? e)); } }, [aid]);
  return { connected: conn, connecting: cing, lastError: err, connect, disconnect };
}
