// Fake NCDB-style prototype records only.
// This module is intentionally isolated so cleaned real NCDB extracts can replace
// these arrays without changing the React screens or reasoning workflow.
export const ncdbFieldLabels = {
  P_AGE: 'Driver age',
  V_YEAR: 'Vehicle year',
  V_TYPE: 'Vehicle type',
  C_WTHR: 'Weather condition',
  C_RSUR: 'Road surface condition',
  C_MNTH: 'Collision month',
  C_SEV: 'Collision severity',
  P_ISEV: 'Person injury severity',
  C_WDAY: 'Day of week',
  C_HOUR: 'Collision hour',
  C_CONF: 'Collision configuration',
}

export const ncdbSupportedVariables = Object.keys(ncdbFieldLabels)

export const activeDataset = {
  fileName: 'mock-risk-evidence-base.csv',
  fileType: 'CSV',
  uploadedAt: '2026-05-30 10:44 UTC',
  recordsLoaded: '24,618',
  yearRange: '2005–2025',
  missingValues: '47 flagged for review',
  qualityStatus: 'Ready for risk assessment',
  readiness: 'Ready',
  detectedColumns: Object.values(ncdbFieldLabels),
}

export const baseProfiles = [
  {
    id: 'CASE-MOCK-0187',
    name: 'Mock Case Alpha',
    P_AGE: 22,
    V_YEAR: 2009,
    V_TYPE: 'Passenger car',
    C_WTHR: 'Clear',
    C_RSUR: 'Dry',
    C_MNTH: 'November',
    C_SEV: 'Injury',
    P_ISEV: 'Minor injury',
    C_WDAY: 'Friday',
    C_HOUR: 23,
    C_CONF: 'Rear-end',
    baselineRiskIndex: 67,
  },
  {
    id: 'CASE-MOCK-0412',
    name: 'Mock Case Bravo',
    P_AGE: 45,
    V_YEAR: 2021,
    V_TYPE: 'Light truck',
    C_WTHR: 'Rain',
    C_RSUR: 'Wet',
    C_MNTH: 'March',
    C_SEV: 'Property damage only',
    P_ISEV: 'No injury',
    C_WDAY: 'Tuesday',
    C_HOUR: 8,
    C_CONF: 'Turning movement',
    baselineRiskIndex: 39,
  },
  {
    id: 'CASE-MOCK-0774',
    name: 'Mock Case Charlie',
    P_AGE: 71,
    V_YEAR: 2005,
    V_TYPE: 'Motorcycle',
    C_WTHR: 'Snow',
    C_RSUR: 'Ice',
    C_MNTH: 'January',
    C_SEV: 'Fatality',
    P_ISEV: 'Serious injury',
    C_WDAY: 'Saturday',
    C_HOUR: 1,
    C_CONF: 'Single vehicle',
    baselineRiskIndex: 89,
  },
]

export const initialAuditRows = [
  {
    timestamp: '2026-05-30 09:14 UTC',
    fileCaseId: 'mock-risk-evidence-base.csv',
    recommendation: 'Data file uploaded',
    confidence: 'N/A',
    scenario: 'N/A',
    decision: 'Evidence base refreshed',
    reason: 'N/A',
    summary: 'Uploaded mock NCDB-style historical collision data and confirmed readiness for risk assessment.',
  },
  {
    timestamp: '2026-05-30 09:32 UTC',
    fileCaseId: 'CASE-MOCK-0187',
    recommendation: 'Moderate',
    confidence: '88%',
    scenario: 'Risk assessment generated',
    decision: 'Human review pending',
    reason: 'N/A',
    summary: 'Agent identified vehicle age, collision severity, injury severity, and late-hour exposure as the main relative-risk drivers.',
  },
  {
    timestamp: '2026-05-30 10:02 UTC',
    fileCaseId: 'CASE-MOCK-0774',
    recommendation: 'High',
    confidence: '94%',
    scenario: 'Senior review requested',
    decision: 'Sent to senior underwriter review',
    reason: 'Collision severity and injury severity require senior review.',
    summary: 'Collision severity, injury severity, winter road surface, and vehicle type sustained a high relative-risk recommendation.',
  },
]
