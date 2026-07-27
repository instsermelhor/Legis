# ADR-039: Sprint 6 Enterprise Legal AI Platform — Multi-Model AI Gateway, RAG Hybrid Search & Legal Copilot XAI
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief AI Officer, Chief Data Officer, AI Platform Architect, AI Governance Officer

## Contexto
Após o desenvolvimento da suíte de Legal Operations na Sprint 5 (Prompt 252), a Sprint 6 introduz a camada de Inteligência Artificial da Legis Connect. O desafio é disponibilizar modelos de linguagem generativos e algoritmos de recomendação com máxima precisão, sem alucinações, com total rastreabilidade das fontes (XAI) e dentro das diretrizes de segurança da ISO/IEC 42001 e do NIST AI RMF.

## Decisões Técnicas

### 1. Arquitetura LLM-Agnostic via LiteLLM Cost & Model Router
- Adotar o LiteLLM como gateway único de IA, permitindo o roteamento dinâmico de tarefas entre modelos locais de custo zero (vLLM DeepSeek / Llama 3) e modelos comerciais de alta performance (GPT-4o, Claude 3.5 Sonnet).

### 2. RAG Híbrido (pgvector + BM25 + Cohere Rerank)
- Implementar busca híbrida combinando busca vetorial pgvector (HNSW) e busca textual BM25 no PostgreSQL com reordenação de precisão via Cohere Rerank, garantindo que o contexto injetado no prompt seja 100% relevante.

### 3. Explicabilidade Mandatória (Explainable AI - XAI)
- Todas as respostas do Copilot Jurídico devem obrigatoriamente retornar a lista de citações (artigos de lei, jurisprudências ou cláusulas de contratos) com seus respectivos scores de confiança. Respostas com confiança < 80% exigem supervisão humana (*Human-in-the-Loop*).

### 4. Emissão da Autorização para Início da Sprint 7
- Certificar a conclusão da Sprint 6 com 93.1% de cobertura de testes e emitir a ordem executiva **AUTH-SPRINT7-2026-001** autorizando o desenvolvimento dos módulos de Business Intelligence Jurídico, Data Lakehouse Apache Iceberg e Decision Intelligence.

## Consequências
- Positivas: Automação cognitiva de alta precisão; eliminação de dependência de fornecedor único de LLM; conformidade total com LGPD e ISO 42001.
- Regra de Ouro: Proibição estrita de envio de petições ou pareceres a terceiros sem revisão humana prévia.
