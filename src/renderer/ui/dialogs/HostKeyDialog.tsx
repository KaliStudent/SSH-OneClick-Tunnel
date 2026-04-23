import React from 'react';
import { Dialog, Button } from '../components';
type HKE = { profileId: string; host: string; hashAlgo: string; fingerprint: string; known: string | null; changed: boolean };
type P = { open: boolean; event: HKE | null; onRespond: (ok: boolean) => void };
export default function HostKeyDialog({ open, event, onRespond }: P) {
  if (!event) return null;
  return (<Dialog open={open} onClose={() => onRespond(false)} title={event.changed ? '⚠️ Host Key Changed!' : '🔑 Verify Host'} description={event.changed ? 'Server identity changed.' : 'First connection. Verify identity.'} footer={<><Button variant={event.changed ? 'primary' : 'ghost'} onClick={() => onRespond(false)}>Reject</Button><Button variant={event.changed ? 'danger' : 'primary'} onClick={() => onRespond(true)}>{event.changed ? 'Trust Anyway' : 'Trust & Connect'}</Button></>}>
    <div className="col gap-md">{event.changed && <div className="key-changed-warning"><strong>WARNING:</strong> Key for <strong>{event.host}</strong> changed!</div>}<div className="field"><label className="field-label">Host</label><div className="fingerprint-display">{event.host}</div></div><div className="field"><label className="field-label">Fingerprint ({event.hashAlgo})</label><div className="fingerprint-display">{event.fingerprint}</div></div>{!event.changed && <div className="explain-panel open"><div className="explain-panel-inner">Every SSH server has a unique fingerprint. Verifying ensures you connect to the real server.</div></div>}</div></Dialog>);
}
