import React, { useMemo, useState } from 'react';
import { Shield, Lock, Key, Bug, TerminalSquare, CheckCircle2 } from 'lucide-react';

const NavButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
      active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
    }`}
  >
    {children}
  </button>
);

const Tab = ({ id, activeTab, children }) => (activeTab === id ? <div className="space-y-4">{children}</div> : null);

const defaultSimulatorState = {
  uniqueUserFields: false,
  strictSecurityReq: true,
  complianceAudit: true,
  crossServiceIdentity: false,
  offlineMode: false
};

export default function AuthOwnershipGuide() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [simulator, setSimulator] = useState(defaultSimulatorState);
  const [debuggerMode, setDebuggerMode] = useState('library');

  const trustScore = useMemo(() => {
    let score = 48;
    if (simulator.uniqueUserFields) score += 18;
    if (simulator.strictSecurityReq) score += 12;
    if (simulator.complianceAudit) score += 10;
    if (simulator.crossServiceIdentity) score += 8;
    if (simulator.offlineMode) score += 4;
    return Math.min(100, score);
  }, [simulator]);

  const toggleFlag = (key) => setSimulator((prev) => ({ ...prev, [key]: !prev[key] }));

  const libraryLog = [
    '[auth-lib] Initializing provider adapter...',
    '[auth-lib] Mapping claims -> user schema (fixed)',
    '[auth-lib] Error: token context missing in middleware',
    '[auth-lib] Stack trace points to minified internal bundle'
  ];

  const customLog = [
    '[custom-auth] Loading signed session payload...',
    '[custom-auth] Validating route constraints + org scope',
    '[custom-auth] User schema hydrated with custom fields',
    '[custom-auth] Success: traceable auth path with full visibility'
  ];

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Architecture • Security • Culture</p>
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Why We Stopped Using Auth Libraries</h1>
        <p className="text-sm text-zinc-600 sm:text-base">
          A mobile-first walkthrough of the trust trade-offs between third-party auth abstractions and owning your auth layer.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        <NavButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')}>Simulator</NavButton>
        <NavButton active={activeTab === 'debugger'} onClick={() => setActiveTab('debugger')}>Black Box Debugger</NavButton>
        <NavButton active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')}>Checklist</NavButton>
      </nav>

      <Tab id="simulator" activeTab={activeTab}>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-zinc-900">Trust Score Simulator</h2>
          <div className="grid gap-2">
            {[
              ['uniqueUserFields', 'Need unique user schema fields', Key],
              ['strictSecurityReq', 'Strict security requirements', Lock],
              ['complianceAudit', 'Compliance + auditability needs', Shield],
              ['crossServiceIdentity', 'Cross-service identity coordination', CheckCircle2],
              ['offlineMode', 'Offline-first auth fallback', TerminalSquare]
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFlag(key)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                  simulator[key] ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2"><Icon size={16} />{label}</span>
                <span>{simulator[key] ? 'On' : 'Off'}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-700">Current trust score: <strong>{trustScore}/100</strong></p>
        </div>
      </Tab>

      <Tab id="debugger" activeTab={activeTab}>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-4 text-zinc-100 shadow-sm">
          <div className="mb-3 flex gap-2">
            <NavButton active={debuggerMode === 'library'} onClick={() => setDebuggerMode('library')}>Library Mode</NavButton>
            <NavButton active={debuggerMode === 'custom'} onClick={() => setDebuggerMode('custom')}>Custom Mode</NavButton>
          </div>
          <div className="space-y-2 font-mono text-xs sm:text-sm">
            {(debuggerMode === 'library' ? libraryLog : customLog).map((line) => (
              <p key={line} className="break-words">{line}</p>
            ))}
          </div>
        </div>
      </Tab>

      <Tab id="checklist" activeTab={activeTab}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Can your team explain auth flow without vendor docs?',
            'Are schema changes blocked by provider constraints?',
            'Can you trace every failure in production logs?',
            'Do compliance requirements need first-party visibility?'
          ].map((item) => (
            <article key={item} className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
              <div className="mb-2 flex items-center gap-2 font-semibold text-zinc-900"><Bug size={16} />Decision Check</div>
              {item}
            </article>
          ))}
        </div>
      </Tab>
    </section>
  );
}
