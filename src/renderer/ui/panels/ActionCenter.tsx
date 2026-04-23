import React from 'react';
type Action = { icon: string; title: string; desc: string; cmd: string };
const actions: Action[] = [
  { icon: '💾', title: 'Disk Usage', desc: 'Check disk space.', cmd: 'df -h' },
  { icon: '🧠', title: 'Memory', desc: 'RAM and swap.', cmd: 'free -h' },
  { icon: '⏱️', title: 'Uptime', desc: 'How long running?', cmd: 'uptime' },
  { icon: '⚙️', title: 'Services', desc: 'Active services.', cmd: 'systemctl list-units --type=service --state=running --no-pager' },
  { icon: '📋', title: 'Logs', desc: 'Last 50 entries.', cmd: 'journalctl -n 50 --no-pager' },
  { icon: '🌐', title: 'Network', desc: 'Listening ports.', cmd: 'ss -tuln' },
  { icon: '👥', title: "Who's On", desc: 'Current sessions.', cmd: 'who' },
  { icon: '🖥️', title: 'CPU Info', desc: 'Processor details.', cmd: 'lscpu | head -20' },
];
type Props = { connected: boolean; onRunCommand: (cmd: string) => void };
export default function ActionCenter({ connected, onRunCommand }: Props) {
  if (!connected) return <div className="empty-state"><div className="empty-state-icon">⚡</div><div className="empty-state-text">Action Center</div><div className="empty-state-hint">Connect to run actions.</div></div>;
  return (<div><div className="row spread" style={{ marginBottom: 'var(--sp-lg)' }}><div><div className="text-bold" style={{ fontSize: 'var(--fs-lg)' }}>Action Center</div><div className="text-xs text-secondary">Click to run in terminal.</div></div></div><div className="action-grid">{actions.map((a, i) => (<div key={i} className="action-card" onClick={() => onRunCommand(a.cmd)}><div className="action-icon">{a.icon}</div><div className="action-info"><div className="action-title">{a.title}</div><div className="action-desc">{a.desc}</div><div className="action-cmd">{a.cmd}</div></div></div>))}</div></div>);
}
