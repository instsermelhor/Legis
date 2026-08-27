/**
 * api/v1/cases.ts — Vercel Serverless Function (REST API v1)
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoint para consulta e criação de processos jurídicos via API v1.
 * Integrado com EdgeShield (WAF, Rate Limiting e Sanitização).
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
import { dbCases } from '../../lib/db';

async function casesHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const tenantId = (req.headers?.['x-tenant-id'] as string) || (req.query?.tenant_id as string);

  if (req.method === 'GET') {
    const lawyerId = req.query?.lawyer_id as string | undefined;
    const clientId = req.query?.client_id as string | undefined;

    try {
      if (clientId) {
        const data = await dbCases.getByClient(clientId, tenantId);
        return res.status(200).json({ success: true, data });
      }
      const data = await dbCases.getAll(lawyerId, tenantId);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Erro ao consultar processos' });
    }
  }

  if (req.method === 'POST') {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, error: 'Corpo da requisição inválido' });
    }

    try {
      const created = await dbCases.create(req.body, tenantId);
      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Erro ao criar processo' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}

export default EdgeShield.wrapHandler(casesHandler);
