# ADR-029: Evergreen Architecture Strategy, Zero Technical Debt & Automated Fitness Functions
# Status: APROVADO | Data: 27/07/2026 | Decisores: CTO, Chief Enterprise Architect, Chief Platform Engineer, Chief Software Sustainability Officer

## Contexto
Para evitar o acúmulo de complexidade acidental, garantir a sustentabilidade do código-fonte e prevenir a obsolescência tecnológica que afeta plataformas SaaS de grande porte a cada 3 a 5 anos, a Legis Connect estabelece a estratégia de Arquitetura Evergreen e Eliminação Contínua de Legado.

## Decisões Técnicas

### 1. Alocação Obrigatória de Capacidade de Engenharia
- Reservar **20% da capacidade total de engenharia em 100% das Sprints** para tarefas de refatoração contínua, atualização de dependências, eliminação de code smells e melhorias de performance.
- O PMO está proibido de alocar 100% da capacidade da sprint exclusivamente para entregas de produto.

### 2. Automated Architecture Fitness Functions
- Implementar testes estáticos de arquitetura (*Fitness Functions*) integrados ao pipeline de CI/CD (GitHub Actions).
- PRs serão bloqueados automaticamente caso introduzam dependências circulares, reduzam a cobertura de testes abaixo de 85% ou aumentem a taxa de dívida técnica acima de 10%.

### 3. Padrão Strangler Fig para Substituição Tecnológica
- Toda substituição tecnológica ou refatoração estrutural de grande porte deve utilizar o padrão **Strangler Fig** (migração gradual via API Gateway/Route53), proibindo reescritas totais no estilo *big-bang*.

### 4. Política de Depreciação Segura de APIs
- APIs marcadas como descontinuadas devem obrigatoriamente fornecer uma **janela de transição de 6 meses (Sunset Window)** com a inclusão dos cabeçalhos HTTP `Deprecation` e `Sunset`.

## Consequências
- Positivas: Plataforma mantida continuamente moderna, redução sustentada de custos de manutenção, previsibilidade de engenharia.
- Mitigações: Monitoramento contínuo do Platform Health Index (PHI) pelo ARB para evitar acúmulo de débitos não identificados.
