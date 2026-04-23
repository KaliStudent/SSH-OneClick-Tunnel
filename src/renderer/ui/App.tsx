import React, { useState, useEffect, useCallback } from 'react';
import { useProfiles, useSSH, useTunnels } from './hooks';
import { ConnectionPanel, ServicesPanel, TunnelBoard, TerminalPanel, NotesPanel, ActionCenter } from './panels';
import { ProfileDialog, ServiceWizard, TunnelWizard, HostKeyDialog } from './dialogs';

type HKE = { profileId: string; host: string; hashAlgo: string; fingerprint: string; known: string | null; changed: boolean };
type Tab = 'tunnels' | 'terminal' | 'actions' | 'notes';

export default function App() {
  const { profiles, refresh: refreshProfiles, activeProfileId, setActiveProfileId } = useProfiles();
  const { connected, connecting, lastError, connect, disconnect } = useSSH(activeProfileId);
  const { tunnels, refresh: refreshTunnels, closeTunnel } = useTunnels(activeProfileId, connected);
  const [tab, setTab] = useState<Tab>('tunnels');
  const [shellId, setShellId] = useState<string | null>(null);
  const [pendingCmd, setPendingCmd] = useState<string | null>(null);
  const [profileDlg, setProfileDlg] = useState(false);
  const [svcWiz, setSvcWiz] = useState(false);
  const [tunWiz, setTunWiz] = useState(false);
  const [hkEvent, setHkEvent] = useState<HKE | null>(null);
  const [hkOpen, setHkOpen] = useState(false);
  useEffect(() => { window.sshWorkbench.hostkey.onVerify((d: HKE) => { setHkEvent(d); setHkOpen(true); }); }, []);
  const hkRespond = useCallback((ok: boolean) => { if (hkEvent) window.sshWorkbench.hostkey.respond(hkEvent.profileId, ok); setHkOpen(false); setHkEvent(null); }, [hkEvent]);
  useEffect(() => { if (!connected) setShellId(null); }, [connected]);
  function handleRunCommand(cmd: string) { setPendingCmd(cmd); setTab('terminal'); }
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'tunnels', label: 'Tunnels', icon: '🔐' },
    { id: 'terminal', label: 'Terminal', icon: '💻' },
    { id: 'actions', label: 'Actions', icon: '⚡' },
    { id: 'notes', label: 'Notes', icon: '📝' },
  ];
  return (
    <div className="app-layout">
      <div className="sidebar">
        <ConnectionPanel profiles={profiles} activeProfileId={activeProfileId} onSelectProfile={setActiveProfileId} connected={connected} connecting={connecting} lastError={lastError} onConnect={connect} onDisconnect={disconnect} onAddProfile={() => setProfileDlg(true)} />
        <ServicesPanel connected={connected} onOpenServiceWizard={() => setSvcWiz(true)} onOpenTunnelWizard={() => setTunWiz(true)} />
      </div>
      <div className="main-content">
        <div className="tab-bar">{tabs.map(t => (<button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.icon} {t.label}</button>))}</div>
        <div className="tab-content">
          {tab === 'tunnels' && <TunnelBoard tunnels={tunnels} onCloseTunnel={closeTunnel} />}
          {tab === 'terminal' && <TerminalPanel profileId={activeProfileId} connected={connected} shellId={shellId} onShellOpened={setShellId} pendingCommand={pendingCmd} onCommandSent={() => setPendingCmd(null)} />}
          {tab === 'actions' && <ActionCenter connected={connected} onRunCommand={handleRunCommand} />}
          {tab === 'notes' && <NotesPanel profileId={activeProfileId} connected={connected} />}
        </div>
      </div>
      <ProfileDialog open={profileDlg} onClose={() => setProfileDlg(false)} onSaved={refreshProfiles} />
      <ServiceWizard open={svcWiz} onClose={() => setSvcWiz(false)} profileId={activeProfileId} onCreated={refreshTunnels} />
      <TunnelWizard open={tunWiz} onClose={() => setTunWiz(false)} profileId={activeProfileId} onCreated={refreshTunnels} />
      <HostKeyDialog open={hkOpen} event={hkEvent} onRespond={hkRespond} />
    </div>
  );
}
