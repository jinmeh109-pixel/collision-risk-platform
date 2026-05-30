import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { baseProfiles, initialAuditRows, ncdbFieldOptions, ncdbSupportedVariables } from './data/ncdbMockData'
import { scoreProfile } from './lib/riskReasoning'

const iconPaths = {
  AlertTriangle: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  BarChart3: 'M3 3v18h18M7 16V9m5 7V5m5 11v-4',
  BrainCircuit: 'M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 3 3h1v4m5-18a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-3 3h-1v4M9 8h6M9 13h6',
  CheckCircle2: 'M21 12a9 9 0 1 1-6.2-8.6M9 12l2 2 7-7',
  ClipboardCheck: 'M9 5h6M9 3h6v4H9zM7 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 14l2 2 4-5',
  FileClock: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 14v4l3 2',
  GitCompare: 'M18 16V6a2 2 0 0 0-2-2H8m0 0 3-3M8 4l3 3M6 8v10a2 2 0 0 0 2 2h8m0 0-3-3m3 3-3 3',
  Layers3: 'M12 2 2 7l10 5 10-5-10-5Z M2 12l10 5 10-5 M2 17l10 5 10-5',
  LockKeyhole: 'M7 11V7a5 5 0 0 1 10 0v4 M6 11h12v10H6z M12 15v2',
  RotateCcw: 'M3 12a9 9 0 1 0 3-6.7M3 4v6h6',
  Search: 'M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
  ShieldCheck: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-5',
  SlidersHorizontal: 'M3 6h10M17 6h4M14 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z M3 18h4M11 18h10M7 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z M3 12h2M9 12h12M5 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z',
  Sparkles: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
}

function Icon({ name, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  )
}

const AlertTriangle = (props) => <Icon name="AlertTriangle" {...props} />
const BarChart3 = (props) => <Icon name="BarChart3" {...props} />
const BrainCircuit = (props) => <Icon name="BrainCircuit" {...props} />
const CheckCircle2 = (props) => <Icon name="CheckCircle2" {...props} />
const ClipboardCheck = (props) => <Icon name="ClipboardCheck" {...props} />
const FileClock = (props) => <Icon name="FileClock" {...props} />
const GitCompare = (props) => <Icon name="GitCompare" {...props} />
const Layers3 = (props) => <Icon name="Layers3" {...props} />
const LockKeyhole = (props) => <Icon name="LockKeyhole" {...props} />
const RotateCcw = (props) => <Icon name="RotateCcw" {...props} />
const Search = (props) => <Icon name="Search" {...props} />
const ShieldCheck = (props) => <Icon name="ShieldCheck" {...props} />
const SlidersHorizontal = (props) => <Icon name="SlidersHorizontal" {...props} />
const Sparkles = (props) => <Icon name="Sparkles" {...props} />

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'workspace', label: 'Risk Assessment Workspace', icon: BrainCircuit },
  { id: 'simulator', label: 'Scenario Simulator', icon: SlidersHorizontal },
  { id: 'cohort', label: 'Cohort Comparison', icon: GitCompare },
  { id: 'override', label: 'Human Override Review', icon: ClipboardCheck },
  { id: 'audit', label: 'Audit Log', icon: FileClock },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function tierStyles(tier) {
  return {
    Standard: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Elevated: 'bg-amber-50 text-amber-700 ring-amber-200',
    High: 'bg-rose-50 text-rose-700 ring-rose-200',
  }[tier]
}

function App() {
  const [activePage, setActivePage] = useState('workspace')
  const [profile, setProfile] = useState(baseProfiles[0])
  const [scenarioProfile, setScenarioProfile] = useState({ ...baseProfiles[0], V_YEAR: 2023 })
  const [humanDecision, setHumanDecision] = useState('Human continues elevated review')
  const [overrideReason, setOverrideReason] = useState('')
  const [auditRows, setAuditRows] = useState(initialAuditRows)
  const assessment = useMemo(() => scoreProfile(profile), [profile])
  const scenarioAssessment = useMemo(() => scoreProfile(scenarioProfile), [scenarioProfile])
  const isDowngrade = ['High', 'Elevated'].includes(assessment.tier) && humanDecision.includes('Downgrade')

  function updateProfile(key, value) {
    const next = { ...profile, [key]: ['P_AGE', 'V_YEAR', 'C_HOUR', 'sasScore'].includes(key) ? Number(value) : value }
    setProfile(next)
    setScenarioProfile({ ...next, V_YEAR: Math.max(Number(next.V_YEAR), 2023) })
  }

  function recordOverride() {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    setAuditRows([
      {
        timestamp: now,
        profileId: profile.id,
        recommendation: assessment.tier,
        confidence: assessment.confidence,
        scenario: scenarioProfile.V_YEAR !== profile.V_YEAR ? `Vehicle year ${profile.V_YEAR} → ${scenarioProfile.V_YEAR}` : 'No scenario tested',
        decision: humanDecision,
        reason: overrideReason || 'No override reason supplied.',
        summary: assessment.explanation,
      },
      ...auditRows,
    ])
    setActivePage('audit')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-navy-900 text-white lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="rounded-2xl bg-white/10 p-3"><ShieldCheck className="h-6 w-6 text-cyan-200" /></div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Underwriting</p>
            <h1 className="font-semibold">Support Agent</h1>
          </div>
        </div>
        <nav className="space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition',
                  activePage === item.id ? 'bg-white text-navy-900 shadow-soft' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="absolute bottom-0 m-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
          <div className="mb-2 flex items-center gap-2 font-semibold text-white"><LockKeyhole className="h-4 w-4" /> SAS stays authoritative</div>
          <p>This prototype explains, challenges, simulates, and records decisions on top of SAS Intelligent Decisioning.</p>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-navy-500">Fake NCDB-style data · SAS remains authoritative</p>
              <h2 className="text-2xl font-bold text-slate-950">{navItems.find((item) => item.id === activePage)?.label}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none ring-navy-100 focus:ring-4" placeholder="Search profile or audit trail" />
              </div>
              <select
                value={profile.id}
                onChange={(event) => {
                  const selected = baseProfiles.find((item) => item.id === event.target.value)
                  setProfile(selected)
                  setScenarioProfile({ ...selected, V_YEAR: Math.max(selected.V_YEAR, 2023) })
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium outline-none ring-navy-100 focus:ring-4"
              >
                {baseProfiles.map((item) => <option key={item.id}>{item.id}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          {activePage === 'dashboard' && <Dashboard assessment={assessment} auditRows={auditRows} setActivePage={setActivePage} />}
          {activePage === 'workspace' && <Workspace profile={profile} assessment={assessment} updateProfile={updateProfile} />}
          {activePage === 'simulator' && <Simulator profile={profile} assessment={assessment} scenarioProfile={scenarioProfile} setScenarioProfile={setScenarioProfile} scenarioAssessment={scenarioAssessment} />}
          {activePage === 'cohort' && <Cohort profile={profile} assessment={assessment} />}
          {activePage === 'override' && <Override assessment={assessment} humanDecision={humanDecision} setHumanDecision={setHumanDecision} isDowngrade={isDowngrade} overrideReason={overrideReason} setOverrideReason={setOverrideReason} recordOverride={recordOverride} />}
          {activePage === 'audit' && <AuditLog rows={auditRows} />}
        </div>
      </main>
    </div>
  )
}

function Dashboard({ assessment, auditRows, setActivePage }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Current AI risk tier" value={assessment.tier} subtext={`${assessment.confidence} confidence`} />
        <Metric title="Open human reviews" value="3" subtext="1 requires documented rationale" />
        <Metric title="Relative-risk shift" value="-14 pts" subtext="When newer vehicle is applied" />
        <Metric title="Audit records" value={auditRows.length} subtext="Captured with reasoning summaries" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Decisioning command center" eyebrow="Executive overview">
          <div className="grid gap-4 md:grid-cols-3">
            {['SAS model score ingested', 'Agent challenge complete', 'Human review recorded'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-500" />
                <p className="font-semibold">{item}</p>
                <p className="mt-2 text-sm text-slate-500">Traceable status for underwriting governance.</p>
              </div>
            ))}
          </div>
          <button onClick={() => setActivePage('workspace')} className="mt-6 rounded-xl bg-navy-700 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-navy-900">Open risk workspace</button>
        </Card>
        <Card title="Top risk themes" eyebrow="Portfolio signal">
          <div className="space-y-3">
            {['Late-night exposure', 'Vehicle age', 'Adverse road surface', 'Severe collision configuration'].map((theme, index) => (
              <div key={theme} className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <span>{theme}</span>
                <span className="font-semibold text-navy-700">{34 - index * 6}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Workspace({ profile, assessment, updateProfile }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card title="Applicant / risk profile input" eyebrow="NCDB-supported variables">
        <p className="mb-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Prototype data is isolated in <code>src/data/ncdbMockData.js</code>. Replace that module with cleaned NCDB inputs later; the UI uses these supported fields: {ncdbSupportedVariables.join(', ')}.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Profile ID" value={profile.id} readOnly />
          <Field label="SAS model risk score (read from SAS ID)" type="number" value={profile.sasScore} onChange={(value) => updateProfile('sasScore', value)} />
          <Field label="P_AGE" type="number" value={profile.P_AGE} onChange={(value) => updateProfile('P_AGE', value)} />
          <Field label="V_YEAR" type="number" value={profile.V_YEAR} onChange={(value) => updateProfile('V_YEAR', value)} />
          {['V_TYPE', 'C_WTHR', 'C_RSUR', 'C_MNTH', 'C_SEV', 'P_ISEV', 'C_WDAY', 'C_CONF'].map((key) => (
            <SelectField key={key} label={key} value={profile[key]} options={ncdbFieldOptions[key]} onChange={(value) => updateProfile(key, value)} />
          ))}
          <Field label="C_HOUR" type="number" value={profile.C_HOUR} onChange={(value) => updateProfile('C_HOUR', value)} />
        </div>
      </Card>
      <ReasoningPanel assessment={assessment} />
    </div>
  )
}

function ReasoningPanel({ assessment }) {
  return (
    <Card title="Agent reasoning panel" eyebrow="Explain · Challenge · Recommend">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className={classNames('rounded-full px-4 py-2 text-sm font-bold ring-1', tierStyles(assessment.tier))}>Risk tier: {assessment.tier}</span>
        <span className="rounded-full bg-navy-50 px-4 py-2 text-sm font-bold text-navy-700 ring-1 ring-navy-100">Confidence: {assessment.confidence}</span>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">Age factor: {assessment.ageRole}</span>
      </div>
      {assessment.thinData && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm"><strong>Thin-data warning:</strong> Confidence is low. Require additional evidence before relying on the recommendation.</p>
        </div>
      )}
      <section className="space-y-5">
        <InfoBlock title="Primary risk drivers" items={assessment.primaryDrivers} />
        <div>
          <h4 className="font-semibold text-slate-950">Plain-language explanation</h4>
          <p className="mt-2 rounded-2xl bg-slate-50 p-4 leading-7 text-slate-600">{assessment.explanation}</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-950">Recommended action</h4>
          <p className="mt-2 rounded-2xl bg-navy-50 p-4 leading-7 text-navy-800">{assessment.recommendedAction}</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-950">Audit trail</h4>
          <p className="mt-2 rounded-2xl bg-slate-50 p-4 leading-7 text-slate-600">Recommendation, confidence, primary drivers, scenario changes, human decision, override reason, and reasoning summary are captured in the Audit Log when the underwriter records the disposition.</p>
        </div>
        <InfoBlock title="What would change my mind" items={assessment.mindChange} />
      </section>
    </Card>
  )
}

function Simulator({ profile, assessment, scenarioProfile, setScenarioProfile, scenarioAssessment }) {
  return (
    <div className="space-y-6">
      <Card title="Ask a counterfactual" eyebrow="Scenario simulator">
        <div className="rounded-3xl border border-navy-100 bg-gradient-to-r from-navy-50 to-white p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-6 w-6 text-navy-700" />
            <div>
              <p className="text-lg font-semibold">What if this driver switches to a newer vehicle?</p>
              <p className="mt-1 text-slate-600">The simulator changes V_YEAR while keeping the SAS source score visible for governance.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Current V_YEAR" value={profile.V_YEAR} readOnly />
            <Field label="Scenario V_YEAR" type="number" value={scenarioProfile.V_YEAR} onChange={(value) => setScenarioProfile({ ...scenarioProfile, V_YEAR: Number(value) })} />
            <button onClick={() => setScenarioProfile({ ...profile, V_YEAR: 2024 })} className="self-end rounded-xl bg-navy-700 px-4 py-3 font-semibold text-white hover:bg-navy-900"><RotateCcw className="mr-2 inline h-4 w-4" />Use 2024 vehicle</button>
          </div>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <ScenarioCard label="Current recommendation" assessment={assessment} />
        <ScenarioCard label="Simulated recommendation" assessment={scenarioAssessment} />
      </div>
    </div>
  )
}

function ScenarioCard({ label, assessment }) {
  return (
    <Card title={label} eyebrow="Agent result">
      <span className={classNames('rounded-full px-4 py-2 text-sm font-bold ring-1', tierStyles(assessment.tier))}>{assessment.tier}</span>
      <p className="mt-4 text-sm font-semibold text-slate-500">Confidence {assessment.confidence}</p>
      <p className="mt-4 leading-7 text-slate-600">{assessment.explanation}</p>
    </Card>
  )
}

function Cohort({ profile, assessment }) {
  const cohorts = [
    { name: 'Comparable age + vehicle year', risk: 62, count: 148 },
    { name: 'Same weather + road surface', risk: 71, count: 93 },
    { name: 'Same collision configuration', risk: 58, count: 204 },
    { name: 'Full profile nearest neighbors', risk: assessment.rawScore, count: 37 },
  ]
  return (
    <Card title="Cohort comparison" eyebrow="NCDB-style peer view">
      <p className="mb-6 text-slate-600">Comparing {profile.id} with fake cohorts helps underwriters challenge whether the SAS score is directionally consistent.</p>
      <div className="space-y-4">
        {cohorts.map((cohort) => (
          <div key={cohort.name} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{cohort.name}</p>
              <p className="text-sm text-slate-500">n={cohort.count}</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-navy-500" style={{ width: `${cohort.risk}%` }} /></div>
            <p className="mt-2 text-sm text-slate-500">Relative-risk index: {cohort.risk}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Override({ assessment, humanDecision, setHumanDecision, isDowngrade, overrideReason, setOverrideReason, recordOverride }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card title="Human decision" eyebrow="Override workflow">
        <SelectField
          label="Underwriter action"
          value={humanDecision}
          options={['Human accepts agent recommendation', 'Human continues elevated review', 'Downgrade to standard for human review', 'Downgrade with documented rationale', 'Refer to senior underwriter']}
          onChange={setHumanDecision}
        />
        <label className="mt-5 block text-sm font-semibold text-slate-700">Override reason for audit trail</label>
        <textarea value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} className="mt-2 min-h-40 w-full rounded-xl border border-slate-200 p-3 outline-none ring-navy-100 focus:ring-4" placeholder="Document evidence, judgment, and any mitigating conditions..." />
        <button onClick={recordOverride} className="mt-5 w-full rounded-xl bg-navy-700 px-5 py-3 font-semibold text-white hover:bg-navy-900">Record decision to audit log</button>
      </Card>
      <Card title="Agent pushback" eyebrow="Governance guardrail">
        {isDowngrade ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
            <div className="mb-3 flex items-center gap-3"><AlertTriangle className="h-6 w-6" /><h3 className="text-lg font-bold">Downgrade challenged</h3></div>
            <p className="leading-7">The recommendation is {assessment.tier} with {assessment.confidence} confidence. Before lowering the recommendation, document why the primary drivers do not apply or identify new mitigating evidence. Human approval remains the final step, and this reason will be preserved in the audit trail.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <div className="mb-3 flex items-center gap-3"><CheckCircle2 className="h-6 w-6" /><h3 className="text-lg font-bold">No downgrade conflict detected</h3></div>
            <p className="leading-7">The human action is aligned with the agent recommendation or keeps the case in a human review path.</p>
          </div>
        )}
        <InfoBlock title="Drivers requiring rebuttal" items={assessment.primaryDrivers} />
      </Card>
    </div>
  )
}

function AuditLog({ rows }) {
  return (
    <Card title="Audit log" eyebrow="Explainability record">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>{['timestamp', 'profile ID', 'AI recommendation', 'confidence', 'scenario tested', 'human decision', 'override reason', 'reasoning summary'].map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, index) => (
              <tr key={`${row.timestamp}-${index}`} className="align-top hover:bg-slate-50">
                <td className="px-4 py-4 font-medium text-slate-900">{row.timestamp}</td>
                <td className="px-4 py-4">{row.profileId}</td>
                <td className="px-4 py-4"><span className={classNames('rounded-full px-3 py-1 text-xs font-bold ring-1', tierStyles(row.recommendation))}>{row.recommendation}</span></td>
                <td className="px-4 py-4">{row.confidence}</td>
                <td className="px-4 py-4">{row.scenario}</td>
                <td className="px-4 py-4">{row.decision}</td>
                <td className="px-4 py-4 max-w-xs">{row.reason}</td>
                <td className="px-4 py-4 max-w-md">{row.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Metric({ title, value, subtext }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{subtext}</p>
    </div>
  )
}

function Card({ title, eyebrow, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-navy-50 p-2 text-navy-700"><Layers3 className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy-500">{eyebrow}</p>
          <h3 className="text-xl font-bold text-slate-950">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  )
}

function Field({ label, value, onChange, type = 'text', readOnly = false }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-900 outline-none ring-navy-100 focus:ring-4 read-only:bg-slate-50" />
    </label>
  )
}

function SelectField({ label, value, options: fieldOptions, onChange }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-900 outline-none ring-navy-100 focus:ring-4">
        {fieldOptions.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

function InfoBlock({ title, items }) {
  return (
    <div>
      <h4 className="font-semibold text-slate-950">{title}</h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{item}</li>)}
      </ul>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
