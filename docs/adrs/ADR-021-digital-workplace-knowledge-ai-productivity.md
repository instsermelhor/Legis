# ADR-021: Enterprise Digital Workplace Platform — Portal Corporativo, Knowledge Management e AI Productivity Agents
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Digital Workplace Officer, CISO, CTO, CPO

## Contexto
A Legis Connect opera com conhecimento disperso em silos (WhatsApp, e-mail, Google Drive pessoal) e sem
infraestrutura interna para capturar, organizar e ampliar o conhecimento organizacional. A saida de um colaborador
representa perda irreversivel de conhecimento tacito. A producao interna nao e assistida por IA.

## Opcoes Avaliadas

| Abordagem | Custo de Implantacao | Integracao com IA | Escalabilidade Global | Decisao |
|---|---|---|---|---|
| Ferramentas Isoladas (Notion + Slack + Zoom separados) | Baixo | Nenhuma | Baixa (Silos) | Descartada |
| Microsoft 365 Enterprise (SharePoint + Teams + Copilot) | Alto (Licencas) | Moderada (Copilot M365) | Alta | Alternativa |
| **Portal Proprio (Next.js) + Slack/Teams + LMS + AI Agents** | **Medio** | **MAXIMA (LangGraph Agents)** | **TOTAL** | **ESCOLHIDA** |

## Decisao
Adotar a arquitetura de **Portal Corporativo Proprio (Intranet 3.0) integrado a ferramentas best-of-breed**:

1. **Portal Corporativo (Next.js 14)**: Ponto de entrada unico personalizado por funcao e cargo.
2. **Knowledge Management (Notion/Confluence API + ElasticSearch)**: Taxonomia estruturada com busca semantica.
3. **AI Productivity Agents (LangGraph - Prompt 231)**: Agentes especializados por dominio (Legal, Tech, HR, Finance).
4. **Meeting Intelligence (Whisper ASR + LLM Summarization)**: Transcricao e extracao de action items automatica.
5. **LMS Enterprise (Docebo)**: Trilhas de aprendizado personalizadas por cargo com certificados W3C VC (Prompt 234).

## Consequencias
- Positivas: Conhecimento nunca perdido, produtividade amplificada por IA, experiencia do colaborador moderna.
- Mitigacoes: Governanca de conteudo obrigatoria (Knowledge Council) para evitar proliferacao de artigos desatualizados.
