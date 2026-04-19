import React, { useMemo, useState } from 'react';
import { TrendingUp, BarChart3, Terminal, Zap, CheckCircle2 } from 'lucide-react';

const tabs = [
  { id: 'simulator', label: 'Simulator', Icon: TrendingUp },
  { id: 'debugger', label: 'Debugger', Icon: Terminal },
  { id: 'playbook', label: 'Playbook', Icon: BarChart3 }
];

const leverConfig = [
  { key: 'interactiveArtifacts', label: 'Interactive Artifacts', impact: 30, Icon: Zap },
  { key: 'distributionCadence', label: 'Weekly Distribution Cadence', impact: 24, Icon: TrendingUp },
  { key: 'retentionLoops', label: 'Retention Loops + Follow-up CTAs', impact: 22, Icon: BarChart3 },
  { key: 'segmentedNarratives', label: 'Segmented Narrative Tracks', impact: 18, Icon: Terminal }
];

const defaultLevers = {
  interactiveArtifacts: true,
  distributionCadence: true,
  retentionLoops: false,
  segmentedNarratives: false
};

function calculateGrowthScore(levers) {
  const baseline = 16;
  const uplift = leverConfig.reduce((sum, lever) => {
    return sum + (levers[lever.key] ? lever.impact : 0);
  }, 0);
  return Math.min(100, baseline + uplift);
}

export default function NewsletterGrowthGuide() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [levers, setLevers] = useState(defaultLevers);
  const [debugMode, setDebugMode] = useState('baseline');

  const impressions = 4992;
  const views = 533;

  const growthScore = useMemo(() => calculateGrowthScore(levers), [levers]);

  const projectedSubscribers = useMemo(() => {
    const conversionRate = 0.04 + growthScore / 500;
    return Math.round(views * conversionRate);
  }, [growthScore, views]);

  const toggleLever = (key) => setLevers((prev) => ({ ...prev, [key]: !prev[key] }));

  const baselineLogs = [
    { level: 'error', line: '[growth-debug] campaign_open_rate stagnating at 10.7%' },
    { level: 'error', line: '[growth-debug] CTA path fragmented across pages' },
    { level: 'error', line: '[growth-debug] new readers bounce before value proof' }
  ];

  const optimizedLogs = [
    { level: 'success', line: '[growth-debug] interactive artifacts enabled (+30 signal)' },
    { level: 'success', line: '[growth-debug] retention loop recovered 17 return visits' },
    { level: 'success', line: '[growth-debug] projected subscriber conversion trend improving' }
  ];

  return (
    <section className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Decision Engine Lab</p>
            <h1 className="text-base font-bold sm:text-lg">90-Day Newsletter Growth Guide</h1>
          </div>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live Scenario</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-4 sm:pb-8">
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
                <MetricCard label="Impressions" value={impressions.toLocaleString()} />
                <MetricCard label="Views" value={views.toLocaleString()} />
              </div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Growth Potential Score</h2>
                <span className="text-sm font-bold text-emerald-600">{growthScore}/100</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${growthScore}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-700">Projected loyal subscribers in 90 days: <strong>{projectedSubscribers}</strong></p>
            </article>

            <article className="grid gap-3">
              {leverConfig.map(({ key, label, Icon, impact }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleLever(key)}
                  className={`min-h-11 w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                    levers[key] ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><Icon size={16} />{label}</span>
                    <span className="font-semibold text-slate-600">+{impact}</span>
                  </span>
                </button>
              ))}
            </article>
          </div>
        )}

        {activeTab === 'debugger' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDebugMode('baseline')}
                  className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
                    debugMode === 'baseline' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Baseline
                </button>
                <button
                  type="button"
                  onClick={() => setDebugMode('optimized')}
                  className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
                    debugMode === 'optimized' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Optimized
                </button>
              </div>
            </div>

            <article className="rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-100 sm:text-sm">
              {(debugMode === 'baseline' ? baselineLogs : optimizedLogs).map((entry) => (
                <p
                  key={entry.line}
                  className={`break-words py-1 ${entry.level === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {entry.line}
                </p>
              ))}
            </article>
          </div>
        )}

        {activeTab === 'playbook' && (
          <div className="space-y-3">
            <PlaybookItem text="Start each issue with one high-friction problem and one high-clarity visual artifact." />
            <PlaybookItem text="Build a 3-email retention loop for readers who open but do not subscribe." />
            <PlaybookItem text="Tie every article to one measurable behavior shift (save, reply, share, subscribe)." />
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

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function PlaybookItem({ text }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2 text-sm text-slate-700">
        <CheckCircle2 className="mt-0.5 text-emerald-600" size={16} />
        <p>{text}</p>
      </div>
    </article>
  );
}

function NavButton({ active, onClick, label, Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-lg px-2 py-2 text-xs font-semibold ${
        active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      <span className="flex flex-col items-center gap-1">
        <Icon size={16} />
        <span>{label}</span>
      </span>
    </button>
  );
}
