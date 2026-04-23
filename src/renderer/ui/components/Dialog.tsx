import React, { useEffect, useState, useCallback } from 'react';
type P = { open: boolean; onClose: () => void; title: string; description?: string; footer?: React.ReactNode; children: React.ReactNode };
export default function Dialog({ open, onClose, title, description, footer, children }: P) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  useEffect(() => { if (open) { setVisible(true); setExiting(false); } else if (visible) { setExiting(true); const t = setTimeout(() => { setVisible(false); setExiting(false); }, 150); return () => clearTimeout(t); } }, [open]);
  const esc = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => { if (visible) { document.addEventListener('keydown', esc); return () => document.removeEventListener('keydown', esc); } }, [visible, esc]);
  if (!visible) return null;
  return (<div className={`dialog-overlay${exiting ? ' exiting' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="dialog-content" role="dialog" aria-modal="true"><div className="dialog-header"><div className="dialog-title">{title}</div>{description && <div className="dialog-desc">{description}</div>}</div><div className="dialog-body">{children}</div>{footer && <div className="dialog-footer">{footer}</div>}</div></div>);
}
