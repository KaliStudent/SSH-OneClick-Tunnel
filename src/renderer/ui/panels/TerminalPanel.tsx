import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

type Props = { profileId: string; connected: boolean; shellId: string | null; onShellOpened: (id: string) => void; pendingCommand: string | null; onCommandSent: () => void };

export default function TerminalPanel({ profileId, connected, shellId, onShellOpened, pendingCommand, onCommandSent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const shellIdRef = useRef<string | null>(shellId);
  shellIdRef.current = shellId;

  useEffect(() => {
    if (!connected || !containerRef.current) return;
    if (termRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      theme: { background: '#0f0f1a', foreground: '#e8e8f0', cursor: '#6c63ff', selectionBackground: '#6c63ff44' },
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
      fontSize: 14, scrollback: 5000,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();
    termRef.current = term;
    fitRef.current = fit;
    window.sshWorkbench.shell.open(profileId, term.cols, term.rows).then((sid) => {
      onShellOpened(sid);
      term.onData((data) => { window.sshWorkbench.shell.write(sid, data); });
    }).catch((err) => { term.writeln('\r\n\x1b[31mFailed to open shell: ' + String(err) + '\x1b[0m'); });
    window.sshWorkbench.shell.onData((_sid: string, data: string) => { if (termRef.current) termRef.current.write(data); });
    window.sshWorkbench.shell.onClosed((_sid: string) => { if (termRef.current) termRef.current.writeln('\r\n\x1b[33m[Shell closed]\x1b[0m'); });
    const ro = new ResizeObserver(() => { if (fitRef.current && termRef.current) { fitRef.current.fit(); const sid = shellIdRef.current; if (sid) window.sshWorkbench.shell.resize(sid, termRef.current.cols, termRef.current.rows); } });
    ro.observe(containerRef.current);
    return () => { ro.disconnect(); if (shellIdRef.current) window.sshWorkbench.shell.close(shellIdRef.current); term.dispose(); termRef.current = null; fitRef.current = null; };
  }, [connected, profileId]);

  useEffect(() => { if (pendingCommand && shellId) { window.sshWorkbench.shell.write(shellId, pendingCommand + '\n'); onCommandSent(); } }, [pendingCommand, shellId]);

  if (!connected) return <div className="empty-state"><div className="empty-state-icon">💻</div><div className="empty-state-text">Terminal</div><div className="empty-state-hint">Connect to a server to open a shell.</div></div>;
  return <div ref={containerRef} className="terminal-container" />;
}
