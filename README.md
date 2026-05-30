# Collision Risk Platform

Clickable React + Vite + Tailwind CSS frontend prototype for an Underwriting Support Agent platform.

The prototype is an agentic reasoning layer on top of SAS Intelligent Decisioning. SAS is treated as the source of the base model risk score; this UI explains, challenges, simulates, and records underwriting decisions using fake NCDB-style data. Human review remains the required final step.

## Prototype scope

- Dashboard
- Risk Assessment Workspace
- Scenario Simulator
- Cohort Comparison
- Human Override Review
- Audit Log

## NCDB-style concept guardrails

The prototype is limited to NCDB-supported concepts: collision severity, injury severity, severity rates, relative risk, cohort comparison, and confidence level. It intentionally avoids monetary outputs and machine-issued disposition outcomes.

## Data replacement points

- `src/data/ncdbMockData.js` contains the fake NCDB-style prototype records, field lists, select options, and seed audit rows.
- `src/lib/riskReasoning.js` contains deterministic prototype reasoning that consumes the SAS score plus NCDB-style fields.
- `src/main.jsx` renders the workflow and should be wired to real data-loading hooks or API clients once cleaned NCDB data is available.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```
