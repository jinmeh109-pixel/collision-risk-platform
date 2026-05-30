# Collision Risk Platform

Clickable React + Vite + Tailwind CSS frontend prototype for an Underwriting Support Agent platform.

The prototype is an explainable reasoning, simulation, and governance layer on top of an existing underwriting decisioning workflow. It uses mock NCDB-style data for now, supports human-in-the-loop review, and records transparent audit evidence. Human review remains the required final decision step.

## Prototype scope

- Dashboard
- Data Learning Hub
- Risk Assessment Workspace
- Scenario Simulator
- Cohort Comparison
- Human Review
- Audit Log

## NCDB-style concept guardrails

The prototype is limited to NCDB-supported concepts: collision severity, injury severity, severity rates, relative risk, cohort comparison, and confidence level. It intentionally avoids monetary outputs and machine-issued disposition outcomes.

## Data replacement points

- `src/data/ncdbMockData.js` contains the fake NCDB-style prototype records, readable field labels, upload summary metadata, and seed audit rows.
- `src/lib/riskReasoning.js` contains deterministic prototype reasoning that consumes the baseline risk index plus NCDB-style fields.
- `src/main.jsx` renders the workflow and should be wired to real data-loading hooks or API clients once cleaned NCDB data is available.

## Local development

The prototype targets Node 18+ and Vite 5.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```
