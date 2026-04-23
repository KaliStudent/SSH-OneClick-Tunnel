import React from 'react';
import { Card, Button } from '../components';
type P = { connected: boolean; onOpenServiceWizard: () => void; onOpenTunnelWizard: () => void };
export default function ServicesPanel({ connected, onOpenServiceWizard, onOpenTunnelWizard }: P) {
  return (<Card title="Secure Services" subtitle="One-click through SSH." visor>
    <div className="col gap-md"><Button variant="primary" fullWidth onClick={onOpenServiceWizard} disabled={!connected}>🚀 Launch Service...</Button><Button fullWidth onClick={onOpenTunnelWizard} disabled={!connected}>🔗 Disposable Tunnel...</Button></div>
    <div className="hr" /><div className="text-xs text-secondary" style={{ lineHeight: '1.6' }}>Temporary encrypted paths. No ports exposed. Auto-close on disconnect.</div></Card>);
}
