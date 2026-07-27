# ADR-008: Seleção do Amazon OpenSearch e Neo4j Enterprise para a Plataforma de Conhecimento Jurídico
Status: APROVADO
Data: 27/07/2026
Decisores: CKO, Chief AI Architect, Enterprise Search Architect

## Contexto
Necessidade de busca híbrida combinando relevância léxica (BM25) com semântica vetorial (1536d),
com suporte a consultas em grafo de precedentes jurídicos e latência P95 < 250ms.

## Decisão
Adotar o Amazon OpenSearch como motor primário de busca hipertextual (BM25) e agregação analítica,
extensão pgvector no Aurora PostgreSQL para busca vetorial de embeddings densos (1536d) e Neo4j Enterprise Cluster
como banco de dados em grafo para mapeamento de ontologias e precedentes jurídicos.

## Consequências
- Positivas: Busca híbrida de ponta a ponta, latência P95 < 250ms, suporte nativo a GraphRAG e custos otimizados.
- Mitigações: Complexidade do pipeline de ingestão tratada pelo Kafka MSK + Workers assíncronos.
