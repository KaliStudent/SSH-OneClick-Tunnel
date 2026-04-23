import React from 'react';
import { Button, Badge, ExplainPanel } from '../components';
type T = { id: string; name: string; kind: string; bindHost: string; localPort: number; remoteHost?: string; remotePort?: number; disposable: boolean; createdAt: number; lastActiveAt: number; bytesIn: number; bytesOut: number; status: string; error?: string; explain?: string };
function age(t: number) { const s = Math.max(0, Math.floor((Date.now() - t) / 1000)); if (s < 60) return `${s}s`; const m = Math.floor(s / 60); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h`; }
function bytes(b: number) { if (b < 1024) return `${b}B`; if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`; return `${(b / 1048576).toFixed(1)}MB`; }
export default function TunnelCard({ tunnel: t, onClose }: { tunnel: T; onClose: () => void }) {
  const ok = t.status === 'active';
  return (<div className={`tunnel-card ${ok ? 'tunnel-card-active' : 'tunnel-card-error'}`}><div className="row spread"><div className="text-bold">{t.name}</div><Badge status={ok ? 'ok' : 'error'}>● {t.status}</Badge></div><div className="tunnel-route">{t.bindHost}:{t.localPort} -&gt; {t.remoteHost ?? '—'}:{t.remotePort ?? '—'}</div><div className="tunnel-stats"><span>{age(t.createdAt)} ago</span><span>In:{bytes(t.bytesIn)}</span><span>Out:{bytes(t.bytesOut)}</span></div><div className="row spread mt-sm"><div className="text-xs text-muted">{t.disposable ? 'Disposable' : 'Persistent'}</div><Button size="sm" variant="danger" onClick={onClose}>Close</Button></div>{t.error && <div className="text-sm mt-sm" style={{ color: 'var(--danger)' }}>Error: {t.error}</div>}{t.explain && <ExplainPanel text={t.explain} />}</div>);
}
