import { useState, useEffect, useCallback, useMemo } from 'react';
type Profile = { id: string; name: string; host: string; port: number; username: string; auth: any };
export function useProfiles() {
  const [ps, setPs] = useState<Profile[]>([]); const [aid, setAid] = useState('');
  const refresh = useCallback(async () => { const p = await window.sshWorkbench.profiles.list(); setPs(p); setAid(prev => { if (prev && p.some((x: Profile) => x.id === prev)) return prev; return p.length ? p[0].id : ''; }); }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const ap = useMemo(() => ps.find(p => p.id === aid) ?? null, [ps, aid]);
  return { profiles: ps, refresh, activeProfileId: aid, setActiveProfileId: setAid, activeProfile: ap };
}
