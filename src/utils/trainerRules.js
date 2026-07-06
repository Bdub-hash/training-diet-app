const FINISHER_PATTERN = /finisher/i;

export function evaluateRecovery(recoveryPct) {
  const value = Number(recoveryPct);
  if (Number.isNaN(value)) {
    return null;
  }
  if (value >= 67) {
    return {
      zone: 'green',
      label: 'Green',
      summary: "Recovery is solid — proceed with today's session as planned.",
    };
  }
  if (value >= 34) {
    return {
      zone: 'yellow',
      label: 'Yellow',
      summary: 'Recovery is moderate — reduce volume by about 20%, keep intensity, and skip finishers.',
    };
  }
  return {
    zone: 'red',
    label: 'Red',
    summary: 'Recovery is low — rest or an easy walk only today. No strength work.',
  };
}

export function evaluateSleepCaution(sleepHours) {
  const value = Number(sleepHours);
  if (Number.isNaN(value)) {
    return null;
  }
  if (value < 6) {
    return 'Sleep was under 6 hours — consider trimming a set or two even if recovery looks fine.';
  }
  return null;
}

export function buildAdjustedPlan(exercises, zone) {
  if (zone === 'red') {
    return [];
  }
  if (zone === 'yellow') {
    return exercises
      .filter((exercise) => !FINISHER_PATTERN.test(exercise.name))
      .map((exercise) => ({
        ...exercise,
        sets: Math.max(1, Math.round(exercise.sets * 0.8)),
      }));
  }
  return exercises.map((exercise) => ({ ...exercise }));
}
