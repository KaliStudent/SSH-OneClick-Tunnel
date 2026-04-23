import { useState, useEffect, useCallback, useRef } from 'react';
type T = { id: string; name: string; kind: string; bindHost: string; localPort: number; remoteHost?: string; remotePort?: number; disposable: boolean; createdAt: number; lastActiveAt: number; bytesIn: number; bytesOut: number; status: string; error?: string; explain?: string };
export function useTunnels(aid: string, conn: boolean) {
  const [ts, setTs] = useState<T[]>([]); const r = useRef(aid); r.current = aid;
  const refresh = useCallback(async () => { if (!aid) { setTs([]); return; } try { const t = await window.sshWorkbench.tunnels.list(aid); if (r.current === aid) setTs(t); } catch {} }, [aid]);
  useEffect(() => { if (!aid || !conn) { setTs([]); return; } void refresh(); const t = setInterval(refresh, 1000); return () => clearInterval(t); }, [aid, conn, refresh]);
  const close = useCallback(async (tid: string) => { if (!aid) return; await window.sshWorkbench.tunnels.close(aid, tid); await refresh(); }, [aid, refresh]);
  return { tunnels: ts, refresh, closeTunnel: close };
}
