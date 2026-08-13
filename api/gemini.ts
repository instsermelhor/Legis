/**
 * api/gemini.ts — Vercel Serverless Function Proxy for Google Gemini API
 * ─────────────────────────────────────────────────────────────────────────────
 * SECURITY MANDATE (VULN-004 / Enterprise Compliance):
 * Keeps GEMINI_API_KEY 100% server-side. Never exposes private API credentials
 * to client-side bundles or browser environments.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'USE_PROXY') {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
  }

  try {
    const { model = 'gemini-2.5-flash', contents, generationConfig } = req.body as any;

    if (!contents) {
      return res.status(400).json({ error: 'Campo "contents" obrigatório.' });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[Gemini Serverless Proxy Error]', response.status, errBody);
      return res.status(response.status).json({ error: 'Erro na API Gemini.' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Gemini Serverless Proxy Unhandled Error]', err);
    return res.status(500).json({ error: 'Erro interno no proxy Gemini.' });
  }
}
