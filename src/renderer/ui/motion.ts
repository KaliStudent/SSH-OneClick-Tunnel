import { motion } from './tokens';
export function enterTransition(p = 'all') { return `${p} ${motion.normal} ${motion.easeEnter}`; }
