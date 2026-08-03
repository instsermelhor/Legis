/**
 * server/gemini-proxy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SECURITY FIX: VULN-004 — API Key do Gemini exposta no bundle frontend.
 *
 * Este servidor proxy Node.js intercepta chamadas ao Gemini e injeta a chave
 * de API no lado do servidor, impedindo sua exposição no bundle client-side.
 *
 * COMO USAR:
 *   1. Instale dependências: npm install express cors express-rate-limit helmet
 *   2. Defina a variável de ambiente: GEMINI_API_KEY=sua_chave_real
 *   3. Inicie: node server/gemini-proxy.js
 *   4. Configure o frontend para chamar http://localhost:3001/api/gemini
 *
 * PRODUÇÃO:
 *   - Deploy em Vercel Serverless Functions (api/gemini.js) ou
 *   - Como microserviço Docker separado do frontend
 *   - Use HTTPS obrigatório (Vercel já garante)
 *   - Defina GEMINI_API_KEY nos Secrets do Vercel, NUNCA em código
 */

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PROXY_PORT || 3001;

// ─── VULN-004: A chave nunca sai do servidor ──────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('[SECURITY ERROR] GEMINI_API_KEY não definida. Servidor recusando inicialização.');
  process.exit(1);
}

// ─── Security Headers (VULN-010: CSP + Helmet) ───────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],  // Reduzir em prod removendo unsafe-inline
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
    }
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true }, // HSTS 2 anos
}));

// ─── CORS: Apenas domínios autorizados ────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://www.legisconnect.com.br',
  'https://legisconnect.com.br',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
    else callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── VULN-007: Rate Limiting para prevenir brute-force e abuso da API ─────────
const geminiLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minuto
  max: 20,                    // 20 requests por IP por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
  skip: (req) => process.env.NODE_ENV === 'test',
});

app.use(express.json({ limit: '256kb' })); // Limite de payload

// ─── Proxy Endpoint: POST /api/gemini ─────────────────────────────────────────
app.post('/api/gemini', geminiLimiter, async (req, res) => {
  try {
    const { model = 'gemini-2.5-flash', contents, generationConfig } = req.body;

    // Validação de input (VULN-018 partial fix)
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Campo "contents" obrigatório e deve ser array.' });
    }
    if (contents.length > 50) {
      return res.status(400).json({ error: 'Histórico de conversa excede limite permitido.' });
    }

    // Chamada ao Gemini com a chave no servidor (nunca exposta ao cliente)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[Gemini Proxy Error]', response.status, errBody);
      return res.status(response.status).json({ error: 'Erro na API Gemini.' });
    }

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error('[Gemini Proxy Unhandled Error]', err);
    return res.status(500).json({ error: 'Erro interno no proxy.' });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gemini-proxy' }));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

app.listen(PORT, () => {
  console.log(`[Gemini Proxy] Servidor iniciado na porta ${PORT}`);
  console.log(`[Security] API Key: ${GEMINI_API_KEY ? '✅ Configurada (server-side only)' : '❌ AUSENTE!'}`);
  console.log(`[Security] CORS: ${ALLOWED_ORIGINS.join(', ')}`);
});

module.exports = app;
