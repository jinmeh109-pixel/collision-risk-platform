import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { activeDataset, baseProfiles, initialAuditRows, ncdbFieldLabels } from './data/ncdbMockData'
import { answerAgentQuestion, scoreProfile, simulateScenario } from './lib/riskReasoning'

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
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>
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
  { id: 'data', label: 'Data Learning Hub', icon: Layers3 },
  { id: 'workspace', label: 'Risk Assessment Workspace', icon: BrainCircuit },
  { id: 'simulator', label: 'Scenario Simulator', icon: SlidersHorizontal },
  { id: 'cohort', label: 'Cohort Comparison', icon: GitCompare },
  { id: 'review', label: 'Human Review', icon: ClipboardCheck },
  { id: 'audit', label: 'Audit Log', icon: FileClock },
]

const caseSummaryFields = [
  ['P_AGE', 'Driver age'],
  ['V_YEAR', 'Vehicle year'],
  ['V_TYPE', 'Vehicle type'],
  ['C_WTHR', 'Weather condition'],
  ['C_RSUR', 'Road surface condition'],
  ['C_SEV', 'Collision severity'],
  ['P_ISEV', 'Person injury severity'],
  ['C_HOUR', 'Collision hour'],
  ['C_CONF', 'Collision configuration'],
]

const quickScenarios = ['Newer vehicle', 'Daytime driving', 'Dry road surface', 'Clear weather', 'Lower collision severity', 'Different vehicle type']
const agentQuestions = [
  ['explain', 'Explain this result'],
  ['factor', 'Which factor contributes the most?'],
  ['high', 'Why is this case high risk?'],
  ['evidence', 'What evidence supports this recommendation?'],
  ['reduce', 'What would reduce the risk?'],
  ['review', 'Should this go to human review?'],
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function tierStyles(tier) {
  return {
    Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Moderate: 'bg-amber-50 text-amber-700 ring-amber-200',
    High: 'bg-rose-50 text-rose-700 ring-rose-200',
    'Data file uploaded': 'bg-blue-50 text-blue-700 ring-blue-200',
  }[tier] || 'bg-slate-50 text-slate-700 ring-slate-200'
}

function nowStamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [profile, setProfile] = useState(baseProfiles[0])
  const [dataset, setDataset] = useState(activeDataset)
  const [uploadComplete, setUploadComplete] = useState(true)
  const [auditRows, setAuditRows] = useState(initialAuditRows)
  const [scenarioQuestion, setScenarioQuestion] = useState('What if the vehicle is newer?')
  const [scenarioResult, setScenarioResult] = useState(null)
  const [humanDecision, setHumanDecision] = useState('Accept agent recommendation')
  const [overrideReason, setOverrideReason] = useState('')
  const [reviewRecorded, setReviewRecorded] = useState(false)
  const assessment = useMemo(() => scoreProfile(profile), [profile])

  function addAudit(row) {
    setAuditRows([{ timestamp: nowStamp(), ...row }, ...auditRows])
  }

  function handleUpload(fileName = 'uploaded-risk-data.csv') {
    const nextDataset = { ...activeDataset, fileName, uploadedAt: nowStamp(), recordsLoaded: '24,618', qualityStatus: 'Ready for risk assessment', readiness: 'Ready' }
    setDataset(nextDataset)
    setUploadComplete(true)
    addAudit({
      fileCaseId: fileName,
      recommendation: 'Data file uploaded',
      confidence: 'N/A',
      scenario: 'N/A',
      decision: 'Evidence base refreshed',
      reason: 'N/A',
      summary: 'Data file uploaded and processed for explainable risk reasoning.',
    })
  }

  function runScenario(question = scenarioQuestion) {
    const result = simulateScenario(question, profile, assessment)
    setScenarioQuestion(question)
    setScenarioResult(result)
    if (result.recognized) {
      addAudit({
        fileCaseId: profile.id,
        recommendation: result.simulatedRiskLevel,
        confidence: result.confidence,
        scenario: result.detectedScenario,
        decision: 'What-if scenario tested',
        reason: 'N/A',
        summary: result.explanation,
      })
    }
  }

  function recordHumanDecision() {
    addAudit({
      fileCaseId: profile.id,
      recommendation: assessment.riskLevel,
      confidence: assessment.confidence,
      scenario: 'Human review action',
      decision: humanDecision,
      reason: overrideReason || 'No override reason provided.',
      summary: `${humanDecision} recorded. ${assessment.reasoningSummary}`,
    })
    setReviewRecorded(true)
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
            const IconComponent = item.icon
            return <button key={item.id} onClick={() => setActivePage(item.id)} className={classNames('flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition', activePage === item.id ? 'bg-white text-navy-900 shadow-soft' : 'text-slate-300 hover:bg-white/10 hover:text-white')}><IconComponent className="h-5 w-5" />{item.label}</button>
          })}
        </nav>
        <div className="absolute bottom-0 m-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
          <div className="mb-2 flex items-center gap-2 font-semibold text-white"><LockKeyhole className="h-4 w-4" /> Human-in-the-loop</div>
          <p>The agent explains, simulates, and records evidence. Human reviewers make the final decision.</p>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-navy-500">Mock NCDB-style data · Explainable governance layer</p>
              <h2 className="text-2xl font-bold text-slate-950">{navItems.find((item) => item.id === activePage)?.label}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none ring-navy-100 focus:ring-4" placeholder="Search case, file, or audit trail" />
              </div>
              <select value={profile.id} onChange={(event) => setProfile(baseProfiles.find((item) => item.id === event.target.value))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium outline-none ring-navy-100 focus:ring-4">
                {baseProfiles.map((item) => <option key={item.id}>{item.id}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          {activePage === 'dashboard' && <Dashboard auditRows={auditRows} setActivePage={setActivePage} />}
          {activePage === 'data' && <DataLearningHub dataset={dataset} uploadComplete={uploadComplete} handleUpload={handleUpload} />}
          {activePage === 'workspace' && <Workspace dataset={dataset} profile={profile} assessment={assessment} />}
          {activePage === 'simulator' && <Simulator question={scenarioQuestion} setQuestion={setScenarioQuestion} runScenario={runScenario} result={scenarioResult} assessment={assessment} />}
          {activePage === 'cohort' && <Cohort profile={profile} assessment={assessment} />}
          {activePage === 'review' && <HumanReview assessment={assessment} humanDecision={humanDecision} setHumanDecision={setHumanDecision} overrideReason={overrideReason} setOverrideReason={setOverrideReason} recordHumanDecision={recordHumanDecision} reviewRecorded={reviewRecorded} />}
          {activePage === 'audit' && <AuditLog rows={auditRows} />}
        </div>
      </main>
    </div>
  )
}

function Dashboard({ auditRows, setActivePage }) {
  const metrics = [
    ['Uploaded datasets', '3', '1 refreshed today'],
    ['Cases analyzed', '128', '24 in current portfolio'],
    ['High-risk cases', '17', 'Escalation queue'],
    ['Human reviews required', '31', 'Awaiting reviewer action'],
    ['What-if simulations run', '42', 'Scenario evidence captured'],
    ['Audit records created', auditRows.length, 'Governance-ready trail'],
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{metrics.map(([title, value, subtext]) => <Metric key={title} title={title} value={value} subtext={subtext} />)}</div>
      <Card title="Platform workflow" eyebrow="Human-in-the-loop lifecycle">
        <div className="grid gap-3 md:grid-cols-5">
          {['Upload Data File', 'Risk Assessment', 'Scenario Simulation', 'Human Review', 'Audit Log'].map((step, index) => (
            <button key={step} onClick={() => setActivePage(['data', 'workspace', 'simulator', 'review', 'audit'][index])} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-navy-200 hover:bg-navy-50">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-white">{index + 1}</div>
              <p className="font-semibold">{step}</p>
              <p className="mt-2 text-sm text-slate-500">{index < 4 ? 'Feeds next workflow step' : 'Records governance evidence'}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

function DataLearningHub({ dataset, uploadComplete, handleUpload }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <UploadRiskDataFile onUpload={handleUpload} uploadComplete={uploadComplete} dataset={dataset} />
      <div className="space-y-6">
        <Card title="Data quality check" eyebrow="Processing summary">
          <SummaryGrid rows={[['Last updated', dataset.uploadedAt], ['Records loaded', dataset.recordsLoaded], ['Year range', dataset.yearRange], ['Missing values flagged', dataset.missingValues], ['Data quality status', dataset.qualityStatus], ['Data readiness status', dataset.readiness]]} />
        </Card>
        <Card title="Detected variables" eyebrow="Readable evidence fields">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(ncdbFieldLabels).map(([code, label]) => <VariablePill key={code} label={label} code={code} />)}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Workspace({ dataset, profile, assessment }) {
  const [activeAnswer, setActiveAnswer] = useState(answerAgentQuestion('explain', profile, assessment))
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <Card title="Case / Data Summary" eyebrow="Read-only selected case">
          <SummaryGrid rows={[[ 'Active file name', dataset.fileName ], [ 'Selected case ID', profile.id ], ...caseSummaryFields.map(([key, label]) => [label, profile[key]]), [ 'Data quality status', dataset.qualityStatus ]]} />
        </Card>
        <Card title="Risk Assessment Result" eyebrow="Agent recommendation">
          <div className="mb-5 flex flex-wrap gap-3">
            <span className={classNames('rounded-full px-4 py-2 text-sm font-bold ring-1', tierStyles(assessment.riskLevel))}>Risk level: {assessment.riskLevel}</span>
            <span className="rounded-full bg-navy-50 px-4 py-2 text-sm font-bold text-navy-700 ring-1 ring-navy-100">Confidence: {assessment.confidence}</span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">Human review required: {assessment.humanReviewRequired}</span>
          </div>
          <InfoBlock title="Key risk drivers" items={assessment.primaryDrivers.map((item) => `${item.driver}: ${item.effect}`)} />
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 leading-7 text-slate-600">{assessment.reasoningSummary}</div>
          <div className="mt-4 rounded-2xl bg-navy-50 p-4 font-medium leading-7 text-navy-800">Recommended next step: {assessment.recommendedAction}</div>
        </Card>
        <Card title="Interactive Agent Questions" eyebrow="Deterministic prototype responses">
          <div className="flex flex-wrap gap-2">
            {agentQuestions.map(([key, label]) => <button key={key} onClick={() => setActiveAnswer(answerAgentQuestion(key, profile, assessment))} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-navy-200 hover:bg-navy-50">{label}</button>)}
          </div>
          <div className="mt-5 rounded-2xl border border-navy-100 bg-navy-50 p-4 leading-7 text-navy-900">{activeAnswer}</div>
        </Card>
      </div>
      <Card title="Risk Driver Contributions" eyebrow="Directional evidence cards">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {assessment.contributions.slice(0, 5).map((item) => <DriverCard key={item.driver} item={item} />)}
        </div>
      </Card>
    </div>
  )
}

function Simulator({ question, setQuestion, runScenario, result, assessment }) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-slate-600">Ask natural-language What-if questions to test how changes in vehicle, timing, severity, or road conditions may affect the risk recommendation.</p>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card title="Ask a What-if Scenario" eyebrow="Natural-language scenario assistant">
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="min-h-36 w-full rounded-2xl border border-slate-200 p-4 outline-none ring-navy-100 focus:ring-4" placeholder="Ask a What-if question, e.g. ‘What if the vehicle is newer?’ or ‘What if the collision happened during daytime?’" />
          <button onClick={() => runScenario()} className="mt-4 rounded-xl bg-navy-700 px-5 py-3 font-semibold text-white hover:bg-navy-900"><Sparkles className="mr-2 inline h-4 w-4" />Run What-if Simulation</button>
          <div className="mt-5 flex flex-wrap gap-2">{quickScenarios.map((chip) => <button key={chip} onClick={() => runScenario(chip)} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-navy-200 hover:bg-navy-50">{chip}</button>)}</div>
        </Card>
        <Card title="Scenario Result" eyebrow="Simulated recommendation">
          {!result && <EmptyState text="Run a What-if simulation to see the detected scenario, changed assumption, risk shift, confidence, and recommended human action." />}
          {result && !result.recognized && <div className="space-y-4"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">{result.message}</div><div className="rounded-2xl bg-slate-50 p-4 text-slate-600">{result.implementationNote}</div></div>}
          {result?.recognized && <ScenarioResult result={result} assessment={assessment} />}
        </Card>
      </div>
    </div>
  )
}

function ScenarioResult({ result, assessment }) {
  return (
    <div className="space-y-4">
      <SummaryGrid rows={[[ 'Detected scenario', result.detectedScenario ], [ 'Changed assumption', result.changedAssumption ], [ 'Original risk level', assessment.riskLevel ], [ 'Simulated risk level', result.simulatedRiskLevel ], [ 'Risk shift', result.riskShift ], [ 'Confidence level', result.confidence ], [ 'Human review required', result.humanReviewRequired ]]} />
      <div className="rounded-2xl bg-slate-50 p-4 leading-7 text-slate-600">{result.explanation}</div>
      <div className="rounded-2xl bg-navy-50 p-4 font-medium leading-7 text-navy-800">Recommended human action: {result.recommendedHumanAction}</div>
    </div>
  )
}

function Cohort({ profile, assessment }) {
  const cohorts = [
    { name: 'Comparable driver age + vehicle year', risk: 62, count: 148 },
    { name: 'Same weather + road surface', risk: 71, count: 93 },
    { name: 'Same collision configuration', risk: 58, count: 204 },
    { name: 'Full case nearest neighbors', risk: assessment.riskIndex, count: 37 },
  ]
  return (
    <Card title="Cohort comparison" eyebrow="Evidence base view">
      <p className="mb-6 text-slate-600">Comparing {profile.id} with mock cohorts helps the reviewer understand whether the recommendation is directionally consistent with historical severity rates.</p>
      <div className="space-y-4">{cohorts.map((cohort) => <div key={cohort.name} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-2 flex items-center justify-between"><p className="font-semibold">{cohort.name}</p><p className="text-sm text-slate-500">n={cohort.count}</p></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-navy-500" style={{ width: `${cohort.risk}%` }} /></div><p className="mt-2 text-sm text-slate-500">Relative-risk index: {cohort.risk}</p></div>)}</div>
    </Card>
  )
}

function HumanReview({ assessment, humanDecision, setHumanDecision, overrideReason, setOverrideReason, recordHumanDecision, reviewRecorded }) {
  const isOverride = humanDecision.includes('Override')
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card title="Human Review Decision" eyebrow="Reviewer remains final decision maker">
        <SelectField label="Reviewer action" value={humanDecision} options={['Accept agent recommendation', 'Request more information', 'Send to senior underwriter review', 'Override recommendation with written rationale']} onChange={(value) => { setHumanDecision(value) }} />
        <label className="mt-5 block text-sm font-semibold text-slate-700">Written rationale</label>
        <textarea value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} className="mt-2 min-h-40 w-full rounded-xl border border-slate-200 p-3 outline-none ring-navy-100 focus:ring-4" placeholder="Document evidence reviewed, mitigated risk drivers, and why the decision is justified..." />
        <button onClick={recordHumanDecision} className="mt-5 w-full rounded-xl bg-navy-700 px-5 py-3 font-semibold text-white hover:bg-navy-900">Record decision to audit log</button>
        {reviewRecorded && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">Decision recorded to audit log.</div>}
      </Card>
      <Card title="Agent Pushback & Rebuttal" eyebrow="Governance guardrail">
        {isOverride ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900"><div className="mb-3 flex items-center gap-3"><AlertTriangle className="h-6 w-6" /><h3 className="text-lg font-bold">Override challenged</h3></div><p className="leading-7">You are challenging the agent’s recommendation. Please document which risk drivers are mitigated and why this decision is justified.</p></div> : <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><div className="mb-3 flex items-center gap-3"><CheckCircle2 className="h-6 w-6" /><h3 className="text-lg font-bold">Human review path preserved</h3></div><p className="leading-7">The selected action keeps the case in a documented human review workflow.</p></div>}
        <InfoBlock title="Risk drivers requiring rebuttal" items={['Vehicle age', 'Injury severity', 'Collision timing', 'Collision configuration', 'Weather / road context']} />
      </Card>
    </div>
  )
}

function AuditLog({ rows }) {
  return (
    <Card title="Audit log" eyebrow="Governance, transparency, and responsible AI">
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {['Data file uploaded', 'Risk assessment generated', 'What-if scenario tested', 'Human recommendation accepted', 'Human override submitted', 'Senior review requested'].map((action) => <div key={action} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">{action}</div>)}
      </div>
      <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500"><tr>{['Timestamp', 'File / Case ID', 'Agent recommendation', 'Confidence', 'Scenario tested', 'Human decision', 'Override reason', 'Reasoning summary'].map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{rows.map((row, index) => <tr key={`${row.timestamp}-${index}`} className="align-top hover:bg-slate-50"><td className="px-4 py-4 font-medium text-slate-900">{row.timestamp}</td><td className="px-4 py-4">{row.fileCaseId}</td><td className="px-4 py-4"><span className={classNames('rounded-full px-3 py-1 text-xs font-bold ring-1', tierStyles(row.recommendation))}>{row.recommendation}</span></td><td className="px-4 py-4">{row.confidence}</td><td className="px-4 py-4">{row.scenario}</td><td className="px-4 py-4">{row.decision}</td><td className="px-4 py-4 max-w-xs">{row.reason}</td><td className="px-4 py-4 max-w-md">{row.summary}</td></tr>)}</tbody></table></div>
    </Card>
  )
}

function UploadRiskDataFile({ onUpload, uploadComplete, dataset }) {
  const inputRef = useRef(null)
  return (
    <Card title="Upload Risk Data File" eyebrow="CSV, Excel, or JSON">
      <div onClick={() => inputRef.current?.click()} className="cursor-pointer rounded-3xl border-2 border-dashed border-navy-100 bg-gradient-to-br from-navy-50 to-white p-8 text-center hover:border-navy-300">
        <Sparkles className="mx-auto h-10 w-10 text-navy-700" />
        <h3 className="mt-4 text-xl font-bold text-slate-950">Drop or select a CSV, Excel, or JSON file</h3>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">Use cleaned NCDB-style historical collision data, internal historical risk records, new case / portfolio data, or mock data for this prototype.</p>
        <button type="button" className="mt-5 rounded-xl bg-navy-700 px-5 py-3 font-semibold text-white hover:bg-navy-900">Select file</button>
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={(event) => onUpload(event.target.files?.[0]?.name || 'uploaded-risk-data.csv')} />
      </div>
      {uploadComplete && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><div className="mb-2 flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" /> File uploaded successfully</div><SummaryGrid rows={[[ 'Detected columns', dataset.detectedColumns.length ], [ 'Records loaded', dataset.recordsLoaded ], [ 'Year range', dataset.yearRange ], [ 'Missing values flagged', dataset.missingValues ], [ 'Data quality status', dataset.qualityStatus ], [ 'Ready for risk assessment', 'Yes' ]]} /></div>}
    </Card>
  )
}

function DriverCard({ item }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="font-bold text-slate-950">{item.driver}</p><p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.effect}</p><p className="mt-3 text-sm leading-6 text-slate-600">{item.explanation}</p><p className="mt-3 text-xs text-slate-400">Source field: {item.sourceField}</p></div>
}

function VariablePill({ label, code }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-900">{label}</p><p className="mt-1 text-xs text-slate-400">Source field: {code}</p></div>
}

function SummaryGrid({ rows }) {
  return <div className="grid gap-3">{rows.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 rounded-xl bg-white p-3 ring-1 ring-slate-200"><span className="text-sm text-slate-500">{label}</span><span className="text-right text-sm font-semibold text-slate-900">{value}</span></div>)}</div>
}

function Metric({ title, value, subtext }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-500">{subtext}</p></div>
}

function Card({ title, eyebrow, children }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"><div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-navy-50 p-2 text-navy-700"><Layers3 className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-navy-500">{eyebrow}</p><h3 className="text-xl font-bold text-slate-950">{title}</h3></div></div>{children}</section>
}

function SelectField({ label, value, options, onChange }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-900 outline-none ring-navy-100 focus:ring-4">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function InfoBlock({ title, items }) {
  return <div className="mt-5"><h4 className="font-semibold text-slate-950">{title}</h4><ul className="mt-2 space-y-2">{items.map((item) => <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{item}</li>)}</ul></div>
}

function EmptyState({ text }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">{text}</div>
}

createRoot(document.getElementById('root')).render(<App />)
