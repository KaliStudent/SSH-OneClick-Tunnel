import React, { useRef, ButtonHTMLAttributes } from 'react';
type P = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost'; size?: 'sm' | 'default'; fullWidth?: boolean };
export default function Button({ variant, size, fullWidth, className = '', children, onClick, ...rest }: P) {
  const ref = useRef<HTMLButtonElement>(null);
  const cls = ['btn', variant === 'primary' && 'btn-primary', variant === 'danger' && 'btn-danger', variant === 'ghost' && 'btn-ghost', size === 'sm' && 'btn-sm', fullWidth && 'btn-full', className].filter(Boolean).join(' ');
  const h = (e: React.MouseEvent<HTMLButtonElement>) => { if (ref.current) { ref.current.classList.add('glow-pulse'); setTimeout(() => ref.current?.classList.remove('glow-pulse'), 400); } onClick?.(e); };
  return <button ref={ref} className={cls} onClick={h} {...rest}>{children}</button>;
}
