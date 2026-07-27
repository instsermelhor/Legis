# ADR-005: Seleção de Provedores de Modelos de Linguagem e Roteamento Híbrido via LiteLLM
Status: APROVADO
Data: 27/07/2026
Decisores: CAIO, CTO, CISO, AI Platform Architect

## Contexto
Necessidade de eliminar lock-in com um único fornecedor de IA, garantir alta disponibilidade com fallback
automático entre LLMs (Claude 3.5, GPT-4o, Llama-3) e otimizar custos via cache semântico in-memory.

## Decisão
Adotar o LiteLLM Router como gateway intermediário de IA, Anthropic Claude 3.5 Sonnet como modelo primário
de raciocínio jurídico complexo, OpenAI GPT-4o como fallback redundante e Redis Enterprise para cache semântico.

## Consequências
- Positivas: Eliminação de ponto único de falha, economia financeira de até 45% em tokens repetidos e latência reduzida.
