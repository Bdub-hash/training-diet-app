const VISION_MODEL = 'claude-sonnet-5';

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function extractJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(jsonText);
}

export async function estimateMealFromPhoto(file, apiKey) {
  const base64 = await fileToBase64(file);
  const mediaType = file.type || 'image/jpeg';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            {
              type: 'text',
              text:
                'Identify the meal in this photo and estimate its total calories and protein. ' +
                'Respond with ONLY raw JSON (no markdown fences) in this exact shape: ' +
                '{"name": string, "calories": number, "protein_g": number, "confidence": "low"|"medium"|"high", ' +
                '"evidence": string (briefly list the typical calorie/protein values per component you used to build the estimate)}',
            },
          ],
        },
      ],
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
