import React, { useState } from 'react';
export default function ExplainPanel({ text }: { text: string }) {
  const [o, setO] = useState(false);
  return (<div><button className="explain-toggle" onClick={() => setO(!o)}>{o ? '▾ Hide' : '▸ Explain this'}</button><div className={`explain-panel ${o ? 'open' : ''}`}><div className="explain-panel-inner">{text}</div></div></div>);
}
