import React from 'react';
import { Card, Button, Badge, Select } from '../components';
type P = { profiles: any[]; activeProfileId: string; onSelectProfile: (id: string) => void; connected: boolean; connecting: boolean; lastError?: string; onConnect: () => void; onDisconnect: () => void; onAddProfile: () => void };
export default function ConnectionPanel({ profiles, activeProfileId, onSelectProfile, connected, connecting, lastError, onConnect, onDisconnect, onAddProfile }: P) {
  const opts = profiles.map((p: any) => ({ value: p.id, label: `${p.name} (${p.username}@${p.host})` }));
  return (<Card title="Connection" subtitle="Select profile, then connect." titleRight={<Badge status={connected ? 'ok' : lastError ? 'error' : 'neutral'}>{connected ? '● Connected' : connecting ? '● Connecting...' : lastError ? '● Error' : '● Disconnected'}</Badge>} visor>
    <Select label="" value={activeProfileId} onChange={onSelectProfile} options={opts} placeholder="Select..." />
    <div className="row mt-sm">{!connected ? <Button variant="primary" fullWidth onClick={onConnect} disabled={!activeProfileId || connecting}>{connecting ? 'Connecting...' : 'Connect'}</Button> : <Button variant="danger" fullWidth onClick={onDisconnect}>Disconnect</Button>}<Button onClick={onAddProfile}>+ Profile</Button></div>
    {lastError && <div className="text-sm mt-sm" style={{ color: 'var(--danger)' }}>{lastError}</div>}
    {!lastError && <div className="text-xs text-muted mt-sm">Tunnels bind to 127.0.0.1 only.</div>}</Card>);
}
