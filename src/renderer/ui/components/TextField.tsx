import React from 'react';
type P = { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; textarea?: boolean; autoFocus?: boolean };
export default function TextField({ label, hint, value, onChange, placeholder, type = 'text', textarea, autoFocus }: P) {
  return (<div className="field">{label && <label className="field-label">{label}</label>}{textarea ? <textarea className="textarea" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} /> : <input className="input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} />}{hint && <div className="field-hint">{hint}</div>}</div>);
}
