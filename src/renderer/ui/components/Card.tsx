import React from 'react';
type P = { title?: string; subtitle?: string; titleRight?: React.ReactNode; visor?: boolean; children: React.ReactNode; className?: string };
export default function Card({ title, subtitle, titleRight, visor, children, className = '' }: P) {
  return (<div className={`card ${visor ? 'visor-active' : ''} ${className}`}>{(title || titleRight) && <div className="card-header"><div>{title && <div className="card-title">{title}</div>}{subtitle && <div className="card-subtitle">{subtitle}</div>}</div>{titleRight}</div>}{children}</div>);
}
