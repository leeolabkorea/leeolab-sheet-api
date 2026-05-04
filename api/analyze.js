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
        max_tokens: 1500,
        system: 'You are a product analysis AI. Analyze product photos and return ONLY valid JSON with no markdown, no code fences. Return this structure: {"brand":"...","product_name":"...","meta":"...","form":[{"label":"shape","value":"..."},{"label":"cap","value":"..."},{"label":"body","value":"..."},{"label":"product color","value":"..."},{"label":"front label","value":"..."},{"label":"back label","value":"..."}],"text_exact":[{"label":"line 1","value":"..."},{"label":"line 2","value":"..."},{"label":"brand mark","value":"..."},{"label":"text color","value":"..."},{"label":"key callout","value":"..."},{"label":"ingredients","value":"..."}],"base_prompt":"...studio-lit, sharp focus, photorealistic, 8K quality.","tags":["tag1","tag2","tag3","tag4","tag5"],"negative_prompt":"..."}',
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
