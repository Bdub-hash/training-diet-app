const COACH_MODEL = 'claude-sonnet-5';

function extractJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(jsonText);
}

export async function getTrainerGuidance({ whoop, schedule, rules, apiKey }) {
  const exerciseList = (schedule.exercises || [])
    .map((exercise) => `${exercise.name} (${exercise.sets}x${exercise.reps})`)
    .join(', ');

  const prompt =
    "You are an experienced personal trainer (15+ years) advising a client on today's session, " +
    'based on their WHOOP readiness data. Be concise and practical.\n\n' +
    `Today's planned session: ${schedule.session} — ${exerciseList || 'no discrete exercises (cardio/rest day)'}.\n` +
    `WHOOP data: recovery ${whoop.recovery_pct}%, sleep ${whoop.sleep_hours}h, strain ${whoop.strain}.\n` +
    `Standing rules: ${rules.join(' ')}\n\n` +
    'Respond with ONLY raw JSON (no markdown fences) in this exact shape: ' +
    '{"summary": string (2-3 sentences, coach voice), ' +
    '"exercises": [{"name": string, "sets": number, "reps": string, "action": "keep"|"reduce"|"remove"|"add"}]}';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: COACH_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
  }

  const payload = await response.json();
  const textBlock = payload.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('No text response from model');
  }
  return extractJson(textBlock.text);
}
