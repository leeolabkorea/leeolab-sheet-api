export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
        max_tokens: 1500,
        system: `You are a product analysis AI for a commercial photography studio. Analyze product photos and return ONLY a valid JSON object with no extra text, no markdown, no code fences.

Return this exact structure:
{
  "brand": "brand name",
  "product_name": "full product name as written on label",
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
    {"label": "brand mark", "value": "..."},
    {"label": "text color", "value": "..."},
    {"label": "key callout", "value": "..."},
    {"label": "ingredients", "value": "key ingredients visible"}
  ],
  "base_prompt": "A detailed English product description for AI image generation. Describe shape, materials, colors, label text exactly. End with: studio-lit, sharp focus, photorealistic, 8K quality.",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "negative_prompt": "list things to avoid in generation"
}`,
        messages: req.body.messages,
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
