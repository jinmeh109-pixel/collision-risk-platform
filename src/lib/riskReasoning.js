export function scoreProfile(profile) {
  const vehicleAge = 2026 - Number(profile.V_YEAR)
  const age = Number(profile.P_AGE)
  const hour = Number(profile.C_HOUR)
  const drivers = []
  let adjustment = 0
  let agePoints = 0

  if (vehicleAge >= 15) {
    adjustment += 15
    drivers.push(`Older vehicle year (${profile.V_YEAR}) raises relative risk against the comparison cohort`)
  } else if (vehicleAge <= 5) {
    adjustment -= 8
    drivers.push(`Newer vehicle year (${profile.V_YEAR}) lowers relative risk against the comparison cohort`)
  }

  if (['Motorcycle', 'Heavy truck'].includes(profile.V_TYPE)) {
    adjustment += 14
    drivers.push(`${profile.V_TYPE} cohort has higher collision-severity rates`)
  }

  if (['Snow', 'Freezing rain', 'Fog'].includes(profile.C_WTHR)) {
    adjustment += 11
    drivers.push(`${profile.C_WTHR} weather is linked to elevated severity rates`)
  }

  if (['Ice', 'Snow covered', 'Slush', 'Wet'].includes(profile.C_RSUR)) {
    adjustment += profile.C_RSUR === 'Wet' ? 5 : 12
    drivers.push(`${profile.C_RSUR} road surface increases relative risk in comparable records`)
  }

  if (['Fatality', 'Injury'].includes(profile.C_SEV)) {
    adjustment += profile.C_SEV === 'Fatality' ? 16 : 8
    drivers.push(`${profile.C_SEV} collision severity indicates adverse historical outcomes`)
  }

  if (['Serious injury', 'Minor injury'].includes(profile.P_ISEV)) {
    adjustment += profile.P_ISEV === 'Serious injury' ? 10 : 4
    drivers.push(`${profile.P_ISEV} person-level injury severity increases concern`)
  }

  if (hour >= 22 || hour <= 4) {
    adjustment += 9
    drivers.push(`Collision hour (${hour}:00) is associated with higher severity rates`)
  }

  if (['Head-on', 'Single vehicle'].includes(profile.C_CONF)) {
    adjustment += 9
    drivers.push(`${profile.C_CONF} configuration has higher relative risk`)
  }

  if (age < 25) agePoints = 10
  if (age >= 70) agePoints = 8
  adjustment += agePoints
  if (agePoints) drivers.push(`Driver age (${age}) changes cohort-relative risk`)

  const rawScore = Math.max(5, Math.min(98, Number(profile.sasScore) + adjustment - 12))
  const tier = rawScore >= 75 ? 'High' : rawScore >= 50 ? 'Elevated' : 'Standard'
  const populatedFields = Object.keys(profile).filter((key) => profile[key] !== '' && profile[key] !== null).length
  const thinDataPenalty = populatedFields < 11 ? 22 : 0
  const confidenceValue = Math.max(45, Math.min(94, 72 + drivers.length * 3 - thinDataPenalty))
  const ageRole = agePoints === 0 ? 'Not material' : agePoints >= adjustment * 0.35 ? 'Dominant' : 'Secondary'
  const thinData = confidenceValue < 65

  const primaryDrivers = drivers.slice(0, 4)
  const explanation = `${profile.id} is ${tier.toLowerCase()} after the agentic layer challenged the SAS model score of ${profile.sasScore}. The rationale uses NCDB-supported concepts only: ${primaryDrivers.length ? primaryDrivers.join('; ').toLowerCase() : 'no major adverse severity-rate or relative-risk indicators'}, while preserving SAS Intelligent Decisioning as the source of the base score.`
  const recommendedAction =
    tier === 'High'
      ? 'Recommend senior underwriter review and documented human disposition before any downstream action.'
      : tier === 'Elevated'
        ? 'Recommend targeted human review of the listed relative-risk drivers and supporting evidence.'
        : 'Recommend standard-risk handling for human underwriter review and audit recording.'
  const mindChange =
    tier === 'High'
      ? ['Verified newer vehicle in the same cohort comparison', 'Evidence that severe configuration was anomalous', 'Lower severity rates in a cleaner comparable cohort']
      : tier === 'Elevated'
        ? ['Newer vehicle year', 'Dry/clear operating context', 'No injury or reduced severity evidence']
        : ['New severe collision evidence', 'Adverse weather or surface updates', 'Late-night high-severity exposure']

  return {
    rawScore,
    tier,
    confidenceValue,
    confidence: `${confidenceValue}%`,
    primaryDrivers,
    ageRole,
    explanation,
    recommendedAction,
    mindChange,
    thinData,
  }
}
