import React, { useMemo, useState } from 'react';
import { Shield, Terminal, Layers, Zap, CheckCircle2 } from 'lucide-react';

const tabs = [
  { id: 'simulator', label: 'Simulator', Icon: Shield },
  { id: 'debugger', label: 'Debugger', Icon: Terminal },
  { id: 'checklist', label: 'Checklist', Icon: CheckCircle2 }
];

const simulatorFactors = [
  { key: 'visibility', label: 'Own readable auth code (no black box)', Icon: Layers, impact: 26 },
  { key: 'minimalDeps', label: 'Avoid heavy auth dependency chains', Icon: Zap, impact: 22 },
  { key: 'specDiscipline', label: 'Use platform crypto + JWT spec discipline', Icon: Shield, impact: 24 },
  { key: 'crossAppIdentity', label: 'Need shared identity across multiple apps', Icon: Terminal, impact: 18 }
];

const defaultSimulatorState = {
  visibility: true,
  minimalDeps: true,
  specDiscipline: true,
  crossAppIdentity: false
};

export default function AuthOwnershipGuide() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [simulator, setSimulator] = useState(defaultSimulatorState);
  const [debuggerMode, setDebuggerMode] = useState('old');

  const trustScore = useMemo(() => {
    const base = 10;
    const dynamic = simulatorFactors.reduce((sum, factor) => {
      return sum + (simulator[factor.key] ? factor.impact : 0);
    }, 0);
    return Math.min(100, base + dynamic);
  }, [simulator]);

  const summary = useMemo(() => {
    if (trustScore >= 80) {
      return 'High ownership trust: you can explain, debug, and evolve auth without vendor guesswork.';
    }
    if (trustScore >= 55) {
      return 'Mixed model: you understand key paths, but some risk remains in abstraction or dependency drift.';
    }
    return 'Low ownership trust: you are likely shipping auth behavior you cannot quickly verify under pressure.';
  }, [trustScore]);

  const toggleFlag = (key) => setSimulator((prev) => ({ ...prev, [key]: !prev[key] }));

  const badLogs = [
    '[old-auth] Booting library middleware stack...',
    '[old-auth] Pulling transitive adapters + strategy defaults...',
    '[old-auth] ERROR: token context missing after dependency update',
    '[old-auth] Debug trace lands in minified package internals',
    '[old-auth] Applied forum workaround without clear root cause'
  ];

  const goodLogs = [
    '[new-auth] Parse JWT header.payload.signature',
    '[new-auth] Verify HMAC-SHA256 signature with platform crypto',
    '[new-auth] Validate exp, iss, aud claims explicitly',
    '[new-auth] Attach trusted payload to request context',
    '[new-auth] Failure path is deterministic and fully observable'
  ];

  return (
    <section className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Interactive Guide</p>
            <h1 className="text-base font-bold sm:text-lg">Why We Stopped Using Auth Libraries</h1>
          </div>
          <button type="button" className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold">Menu</button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-4 sm:pb-8">
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Trust Meter</h2>
                <span className="text-sm font-bold text-indigo-600">{trustScore}/100</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${trustScore}%` }} />
              </div>
            </article>

            <article className="grid gap-3">
              {simulatorFactors.map(({ key, label, Icon }) => (
                <ToggleButton key={key} active={simulator[key]} label={label} Icon={Icon} onClick={() => toggleFlag(key)} />
              ))}
            </article>

            <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <h3 className="mb-1 text-sm font-semibold text-indigo-700">Summary</h3>
              <p className="text-sm text-slate-700">{summary}</p>
            </article>
          </div>
        )}

        {activeTab === 'debugger' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDebuggerMode('old')}
                  className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
                    debuggerMode === 'old' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Inefficient / Old Way
                </button>
                <button
                  type="button"
                  onClick={() => setDebuggerMode('new')}
                  className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
                    debuggerMode === 'new' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Optimized / New Way
                </button>
              </div>
            </div>

            <article className="rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-100 sm:text-sm">
              {(debuggerMode === 'old' ? badLogs : goodLogs).map((line) => (
                <p key={line} className="break-words py-1">{line}</p>
              ))}
            </article>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <CheckItem text="Map your auth flow end-to-end: issue token, verify signature, validate claims, handle expiry." />
            <CheckItem text="Use platform crypto primitives only; never invent custom signing or hashing algorithms." />
            <CheckItem text="Add dependencies only when they add clear value you can explain and audit." />

            <article className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-indigo-700">Key Takeaway</h3>
              <p className="text-sm text-slate-700">
                Libraries are tools, not trust. Security improves when your team understands every critical auth decision.
              </p>
            </article>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 p-2 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          {tabs.map(({ id, label, Icon }) => (
            <NavButton key={id} active={activeTab === id} onClick={() => setActiveTab(id)} label={label} Icon={Icon} />
          ))}
        </div>
      </nav>

      <nav className="mx-auto hidden max-w-3xl gap-2 px-4 pb-4 sm:flex">
        {tabs.map(({ id, label, Icon }) => (
          <NavButton key={id} active={activeTab === id} onClick={() => setActiveTab(id)} label={label} Icon={Icon} />
        ))}
      </nav>
    </section>
  );
}

function ToggleButton({ active, onClick, label, Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
        active ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2"><Icon size={16} />{label}</span>
        <span className="font-semibold text-slate-600">{active ? 'On' : 'Off'}</span>
      </span>
    </button>
  );
}

function NavButton({ active, onClick, label, Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-lg px-2 py-2 text-xs font-semibold ${
        active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      <span className="flex flex-col items-center gap-1">
        <Icon size={16} />
        <span>{label}</span>
      </span>
    </button>
  );
}

function CheckItem({ text }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2 text-sm text-slate-700">
        <CheckCircle2 className="mt-0.5 text-indigo-600" size={16} />
        <p>{text}</p>
      </div>
    </article>
  );
}
