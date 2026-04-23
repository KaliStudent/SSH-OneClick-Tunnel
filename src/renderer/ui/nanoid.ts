const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
export function nanoid(n = 12) { let o = ''; for (let i = 0; i < n; i++) o += c[Math.floor(Math.random() * c.length)]; return o; }
