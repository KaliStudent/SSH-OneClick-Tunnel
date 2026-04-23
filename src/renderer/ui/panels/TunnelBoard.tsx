import React from 'react';
import TunnelCard from './TunnelCard';
type T = { id: string; name: string; kind: string; bindHost: string; localPort: number; remoteHost?: string; remotePort?: number; disposable: boolean; createdAt: number; lastActiveAt: number; bytesIn: number; bytesOut: number; status: string; error?: string; explain?: string };
export default function TunnelBoard({ tunnels, onCloseTunnel }: { tunnels: T[]; onCloseTunnel: (id: string) => void }) {
  if (!tunnels.length) return <div className="empty-state"><div className="empty-state-icon">🔐</div><div className="empty-state-text">No active tunnels</div><div className="empty-state-hint">Use "Launch Service" or "Disposable Tunnel" to start.</div></div>;
  return <div className="grid-2">{tunnels.map(t => <TunnelCard key={t.id} tunnel={t} onClose={() => onCloseTunnel(t.id)} />)}</div>;
}
