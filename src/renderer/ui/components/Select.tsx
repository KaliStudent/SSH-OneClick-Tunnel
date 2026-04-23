import React from 'react';
type P = { label: string; hint?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string };
export default function Select({ label, hint, value, onChange, options, placeholder }: P) {
  return (<div className="field">{label && <label className="field-label">{label}</label>}<select className="select" value={value} onChange={e => onChange(e.target.value)}>{placeholder && <option value="" disabled>{placeholder}</option>}{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{hint && <div className="field-hint">{hint}</div>}</div>);
}
