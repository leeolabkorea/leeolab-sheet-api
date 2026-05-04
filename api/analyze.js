export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: `You are a professional product analyst for a commercial photography studio. Analyze the product photos carefully and return ONLY valid JSON with no markdown, no code fences, no extra text.

The base_prompt must be VERY detailed - minimum 4 sentences covering:
1. Exact container shape and material (e.g. "short cylindrical clear glass jar")
2. Cap/lid details (color, material, finish - matte/glossy)
3. Label details (colors, exact text, typography, placement)
4. Product color visible through container
5. Lighting and photography style for AI generation

Return this exact JSON structure:
{
  "brand": "exact brand name from label",
  "product_name": "full exact product name as written on label",
  "meta": "size/weight · material · ref code if visible",
  "form": [
    {"label": "shape", "value": "..."},
    {"label": "cap", "value": "..."},
    {"label": "body", "value": "..."},
    {"label": "product color", "value": "..."},
    {"label": "front label", "value": "..."},
    {"label": "back label", "value": "..."}
  ],
  "text_exact": [
    {"label": "line 1", "value": "exact text from label"},
    {"label": "line 2", "value": "exact text"},
    {"label": "brand mark", "value": "exact brand text"},
    {"label": "text color", "value": "..."},
    {"label": "key callout", "value": "..."},
    {"label": "ingredients", "value": "full ingredient list visible on label"}
  ],
  "base_prompt": "DETAILED 4-sentence description: sentence 1 about container shape/material, sentence 2 about cap/lid, sentence 3 about label design and exact text, sentence 4 about product color and photography style. End with: studio-lit, sharp focus, photorealistic, 8K quality.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "negative_prompt": "blurry, low resolution, distorted text, wrong label color, incorrect product name spelling, extra labels, amateur lighting, out of focus"
}`,
        messages: req.body.messages,
      }),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch (e) {
      res.status(200).json({ debug: text });
    }

  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
}
