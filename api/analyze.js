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
       system: `You are a professional product analyst for a commercial photography studio. Analyze the product photos carefully and return ONLY valid JSON.

The base_prompt must be VERY detailed and specific - at least 3-4 sentences describing:
1. Exact container shape, material, dimensions
2. Cap/lid color, material, finish (matte/glossy)
3. Label colors, typography style, exact text placement
4. Product color visible through container
5. Overall brand aesthetic

Return this structure:
{"brand":"...","product_name":"full exact name from label","meta":"...","form":[{"label":"shape","value":"..."},{"label":"cap","value":"..."},{"label":"body","value":"..."},{"label":"product color","value":"..."},{"label":"front label","value":"..."},{"label":"back label","value":"..."}],"text_exact":[{"label":"line 1","value":"exact text"},{"label":"line 2","value":"exact text"},{"label":"brand mark","value":"..."},{"label":"text color","value":"..."},{"label":"key callout","value":"..."},{"label":"ingredients","value":"full ingredient list visible"}],"base_prompt":"DETAILED description here - minimum 3 sentences covering all visual aspects","tags":["tag1","tag2","tag3","tag4","tag5"],"negative_prompt":"..."}`,
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
