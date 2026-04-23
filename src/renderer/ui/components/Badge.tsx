import React from 'react';
type P = { status: 'ok' | 'error' | 'warning' | 'neutral'; children: React.ReactNode };
const m: Record<string, string> = { ok: 'badge-ok', error: 'badge-error', warning: 'badge-warning', neutral: '' };
export default function Badge({ status, children }: P) { return <span className={`badge ${m[status] ?? ''}`}>{children}</span>; }
