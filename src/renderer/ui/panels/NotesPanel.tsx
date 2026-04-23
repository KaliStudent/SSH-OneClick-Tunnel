import React, { useState, useEffect, useRef } from 'react';
type Props = { profileId: string; connected: boolean };
export default function NotesPanel({ profileId, connected }: Props) {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { if (!profileId) { setContent(''); return; } window.sshWorkbench.notes.load(profileId).then(c => setContent(c)); }, [profileId]);
  function handleChange(v: string) { setContent(v); setSaved(false); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(async () => { await window.sshWorkbench.notes.save(profileId, v); setSaved(true); }, 1000); }
  if (!profileId) return <div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-text">Notes</div><div className="empty-state-hint">Select a profile to see notes.</div></div>;
  return (<div className="notes-panel"><div className="row spread"><div className="text-bold">Notes & Runbook</div><div className="text-xs text-muted">{saved ? '✓ Saved' : 'Saving...'}</div></div><textarea className="notes-textarea" value={content} onChange={e => handleChange(e.target.value)} placeholder="Write notes, commands, checklists..." /></div>);
}
