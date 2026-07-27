-- Configuração da extensão pgvector para Busca Vetorial de IA RAG
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS legis_ai.document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_hnsw ON legis_ai.document_embeddings 
USING hnsw (embedding vector_cosine_ops);
