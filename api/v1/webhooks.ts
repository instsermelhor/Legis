/**
 * api/v1/webhooks.ts — Vercel Serverless Function (REST API v1)
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoint para gerenciamento de subscrições de Webhooks e recepção de eventos.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[]>;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

import { EdgeShield } from '../_edge-shield';
import { dbWebhooks } from '../../lib/db';

async function webhooksHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const tenantId = (req.headers?.['x-tenant-id'] as string) || (req.query?.tenant_id as string);

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Header x-tenant-id é obrigatório para operações de webhook' });
  }

  if (req.method === 'GET') {
    try {
      const subs = await dbWebhooks.getSubscriptions(tenantId);
      return res.status(200).json({ success: true, data: subs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Erro ao consultar webhooks' });
    }
  }

  if (req.method === 'POST') {
    const { url, events, secret } = req.body || {};
    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({ success: false, error: 'Campos url e events (array) são obrigatórios' });
    }

    try {
      const created = await dbWebhooks.createSubscription({
        tenantId,
        url,
        events,
        secret: secret || `whsec_${Math.random().toString(36).substring(2, 15)}`,
        active: true,
      });
      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Erro ao registrar webhook' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}

export default EdgeShield.wrapHandler(webhooksHandler);
