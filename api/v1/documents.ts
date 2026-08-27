/**
 * api/v1/documents.ts — Vercel Serverless Function (REST API v1)
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoint para consulta de versões GED de documentos e geração de URLs assinadas.
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
import { dbGed, dbDocuments } from '../../lib/db';

async function documentsHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const tenantId = (req.headers?.['x-tenant-id'] as string) || (req.query?.tenant_id as string);

  if (req.method === 'GET') {
    const documentId = req.query?.document_id as string | undefined;
    const path = req.query?.path as string | undefined;

    try {
      if (documentId) {
        const versions = await dbGed.getVersions(documentId, tenantId);
        return res.status(200).json({ success: true, documentId, versions });
      }

      if (path) {
        const signedUrl = await dbDocuments.getSignedUrl(path);
        return res.status(200).json({ success: true, signedUrl });
      }

      return res.status(400).json({ success: false, error: 'Parâmetro document_id ou path é obrigatório' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Erro ao processar documento' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}

export default EdgeShield.wrapHandler(documentsHandler);
