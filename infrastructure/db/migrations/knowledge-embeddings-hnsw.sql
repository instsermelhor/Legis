-- Tabela e Índice HNSW para a Plataforma de Conhecimento Jurídico RAG
CREATE TABLE IF NOT EXISTS legis_knowledge.embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    tenant_id UUID, -- NULL = public knowledge (jurisprudência, leis)
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'LAW', 'JURISPRUDENCIA', 'CONTRACT', 'CASE'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice HNSW para busca semântica de alta performance (P95 < 250ms)
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_hnsw
ON legis_knowledge.embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
