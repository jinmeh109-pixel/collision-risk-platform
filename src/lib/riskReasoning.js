export function scoreProfile(profile) {
  const vehicleAge = 2026 - Number(profile.V_YEAR)
  const hour = Number(profile.C_HOUR)
  const contributions = []
  let adjustment = 0

  const addContribution = (driver, effect, explanation, sourceField, points = 0) => {
    adjustment += points
    contributions.push({ driver, effect, explanation, sourceField, points })
  }

  if (vehicleAge >= 15) {
    addContribution('Vehicle age', 'increases risk', `The vehicle is ${vehicleAge} years old, which is higher than the comparison cohort average.`, 'V_YEAR', 15)
  } else if (vehicleAge <= 5) {
    addContribution('Vehicle age', 'lowers risk', `The vehicle is ${vehicleAge} years old, which is favorable in the comparison cohort.`, 'V_YEAR', -8)
  } else {
    addContribution('Vehicle age', 'neutral', 'Vehicle year is close to the middle of the comparison cohort.', 'V_YEAR', 0)
  }

  if (['Serious injury', 'Minor injury'].includes(profile.P_ISEV)) {
    addContribution('Injury severity', profile.P_ISEV === 'Serious injury' ? 'major review driver' : 'increases risk', `${profile.P_ISEV} is an important severity signal for human review.`, 'P_ISEV', profile.P_ISEV === 'Serious injury' ? 13 : 5)
  } else {
    addContribution('Injury severity', 'lowers risk', 'No injury is a favorable person-level severity signal.', 'P_ISEV', -6)
  }

  if (hour >= 22 || hour <= 4) {
    addContribution('Late-hour exposure', 'moderate risk signal', `The collision hour (${hour}:00) is associated with higher severity rates in comparable records.`, 'C_HOUR', 9)
  } else {
    addContribution('Collision timing', 'neutral', `The collision hour (${hour}:00) is within a lower-volatility daytime range.`, 'C_HOUR', -4)
  }

  if (['Head-on', 'Single vehicle'].includes(profile.C_CONF)) {
    addContribution('Collision configuration', 'increases risk', `${profile.C_CONF} events show higher relative risk in the evidence base.`, 'C_CONF', 10)
  } else {
    addContribution('Collision configuration', 'relevant comparison factor', `${profile.C_CONF} is retained as a cohort comparison factor.`, 'C_CONF', 2)
  }

  if (['Ice', 'Snow covered', 'Slush', 'Wet'].includes(profile.C_RSUR) || ['Snow', 'Freezing rain', 'Fog', 'Rain'].includes(profile.C_WTHR)) {
    addContribution('Road/weather context', 'increases risk', `${profile.C_WTHR} weather and ${profile.C_RSUR} road surface add contextual severity-rate concern.`, 'C_WTHR / C_RSUR', profile.C_RSUR === 'Wet' || profile.C_WTHR === 'Rain' ? 6 : 12)
  } else {
    addContribution('Road/weather context', 'lowers risk', `${profile.C_WTHR} weather and ${profile.C_RSUR} road surface reduce contextual concern.`, 'C_WTHR / C_RSUR', -4)
  }

  if (['Fatality', 'Injury'].includes(profile.C_SEV)) {
    addContribution('Collision severity', profile.C_SEV === 'Fatality' ? 'major review driver' : 'increases risk', `${profile.C_SEV} collision severity increases the need for review.`, 'C_SEV', profile.C_SEV === 'Fatality' ? 18 : 8)
  } else {
    addContribution('Collision severity', 'lowers risk', 'Property damage only is a lower-severity outcome in the evidence base.', 'C_SEV', -8)
  }

  if (['Motorcycle', 'Heavy truck'].includes(profile.V_TYPE)) {
    addContribution('Vehicle type', 'increases risk', `${profile.V_TYPE} has higher severity-rate variability in comparable cases.`, 'V_TYPE', 12)
  } else {
    addContribution('Vehicle type', 'neutral', `${profile.V_TYPE} is common in the comparison cohort.`, 'V_TYPE', 0)
  }

  const riskIndex = Math.max(5, Math.min(98, Number(profile.baselineRiskIndex) + adjustment - 10))
  const riskLevel = riskIndex >= 75 ? 'High' : riskIndex >= 50 ? 'Moderate' : 'Low'
  const confidenceValue = Math.max(55, Math.min(94, 76 + contributions.filter((item) => item.points !== 0).length * 3))
  const humanReviewRequired = riskLevel !== 'Low' || contributions.some((item) => item.effect === 'major review driver')
  const keyDrivers = contributions
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)

  const reasoningSummary = `${profile.id} is assessed as ${riskLevel.toLowerCase()} based on cohort-relative evidence. The strongest drivers are ${keyDrivers.map((item) => item.driver.toLowerCase()).join(', ') || 'favorable severity and context signals'}. The agent provides explainability and governance support; a human reviewer remains responsible for the final decision.`

  return {
    riskIndex,
    riskLevel,
    confidenceValue,
    confidence: `${confidenceValue}%`,
    primaryDrivers: keyDrivers,
    contributions,
    reasoningSummary,
    recommendedAction: humanReviewRequired
      ? 'Route to human review with the listed risk drivers and supporting evidence.'
      : 'Proceed to routine human review and retain the assessment in the audit trail.',
    humanReviewRequired: humanReviewRequired ? 'Yes' : 'No',
    mindChange: ['Newer vehicle evidence', 'Lower collision or injury severity', 'Daytime collision timing', 'Clear weather and dry road surface', 'Comparable cohort with lower severity rates'],
  }
}

export function answerAgentQuestion(question, profile, assessment) {
  const topDriver = assessment.primaryDrivers[0]
  const answers = {
    explain: assessment.reasoningSummary,
    factor: topDriver
      ? `${topDriver.driver} contributes the most because ${topDriver.explanation.toLowerCase()}`
      : 'No single adverse driver dominates this case; the current evidence is broadly favorable.',
    high: assessment.riskLevel === 'High'
      ? `This case is high risk because the evidence base shows multiple elevated severity-rate signals, especially ${assessment.primaryDrivers.map((item) => item.driver.toLowerCase()).join(', ')}.`
      : `This case is not currently high risk. It is ${assessment.riskLevel.toLowerCase()} based on the current cohort comparison.`,
    evidence: `The recommendation is supported by uploaded mock records using vehicle, timing, severity, road/weather, and collision-configuration variables. Confidence is ${assessment.confidence}.`,
    reduce: `Risk would be reduced by evidence such as ${assessment.mindChange.slice(0, 3).join(', ').toLowerCase()}.`,
    review: assessment.humanReviewRequired === 'Yes'
      ? 'Yes. Human review is required because the assessment is not low risk or includes major review drivers.'
      : 'Human review remains the final step, but no escalation signal is currently detected.',
  }
  return answers[question]
}

export function simulateScenario(question, profile, assessment) {
  const normalized = question.toLowerCase()
  const simulated = { ...profile }
  let detectedScenario = ''
  let changedAssumption = ''

  if (/newer vehicle|vehicle is newer|newer car|2024/.test(normalized)) {
    simulated.V_YEAR = 2024
    detectedScenario = 'Newer vehicle'
    changedAssumption = 'Vehicle year changed to 2024.'
  } else if (/daytime|morning|afternoon/.test(normalized)) {
    simulated.C_HOUR = 14
    detectedScenario = 'Daytime driving'
    changedAssumption = 'Collision hour changed to 14:00.'
  } else if (/dry road|better road surface/.test(normalized)) {
    simulated.C_RSUR = 'Dry'
    detectedScenario = 'Dry road surface'
    changedAssumption = 'Road surface condition changed to dry.'
  } else if (/clear weather|no snow|no rain/.test(normalized)) {
    simulated.C_WTHR = 'Clear'
    detectedScenario = 'Clear weather'
    changedAssumption = 'Weather condition changed to clear.'
  } else if (/no injury|property damage only|lower severity/.test(normalized)) {
    simulated.P_ISEV = 'No injury'
    simulated.C_SEV = 'Property damage only'
    detectedScenario = 'Lower severity'
    changedAssumption = 'Collision severity changed to property damage only and injury severity changed to no injury.'
  } else if (/suv|truck|motorcycle|vehicle type/.test(normalized)) {
    simulated.V_TYPE = normalized.includes('motorcycle') ? 'Motorcycle' : normalized.includes('truck') ? 'Light truck' : 'SUV'
    detectedScenario = 'Different vehicle type'
    changedAssumption = `Vehicle type changed to ${simulated.V_TYPE}.`
  } else {
    return {
      recognized: false,
      message: 'The prototype could not confidently map this What-if question to a supported risk variable. Please try a scenario related to vehicle year, time of day, weather, road surface, collision severity, or vehicle type.',
      implementationNote: 'In a full implementation, an LLM layer could translate open-ended questions into structured risk variables.',
    }
  }

  const simulatedAssessment = scoreProfile(simulated)
  const shift = simulatedAssessment.riskIndex - assessment.riskIndex

  return {
    recognized: true,
    detectedScenario,
    changedAssumption,
    originalRiskLevel: assessment.riskLevel,
    simulatedRiskLevel: simulatedAssessment.riskLevel,
    riskShift: `${shift > 0 ? '+' : ''}${shift} points`,
    confidence: simulatedAssessment.confidence,
    explanation: `${changedAssumption} The simulated recommendation becomes ${simulatedAssessment.riskLevel.toLowerCase()} because the agent recalculates the cohort-relative severity and context signals.`,
    recommendedHumanAction: simulatedAssessment.humanReviewRequired === 'Yes'
      ? 'Keep this case in human review and document which scenario assumptions are supported by evidence.'
      : 'Continue routine human review and record the scenario in the audit trail.',
    humanReviewRequired: simulatedAssessment.humanReviewRequired,
  }
}
