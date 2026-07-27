# ADR-025: Continuous Architecture Evolution & Technology Radar Governance
# Status: APROVADO | Data: 27/07/2026 | Decisores: CTO, CISO, CDO, Chief Enterprise Architect, Head of Platform Engineering

## Contexto
Com a entrada da Legis Connect em producao, torna-se necessario institucionalizar um processo permanente para evitar a obsolescencia tecnologica e a degradacao arquitetural. Sem um mecanismo continuo de governanca da evolucao, plataformas SaaS tendem a acumular divida tecnica descontrolada e perdem competitividade tecnologica a cada 2-3 anos.

## Decisoes Tecnicas

### 1. Regra dos 20% para Divida Tecnica e Evolucao
- Toda Sprint deve reservar no minimo 20% da capacidade total da equipe de engenharia para refinamento de divida tecnica, atualizacoes de dependencias e melhoria continua.
- Em Sprints pos-incidente P1, essa cota sobe temporariamente para 30%.

### 2. Ciclo de Vida de Tecnologias (Technology Radar)
- Adotar o modelo de 4 aneis (**Adopt, Trial, Assess, Hold**) gerido pelo Architecture Review Board (ARB) com atualizacao trimestral obrigatoria.
- Tecnologias no anel **Hold** devem ter um plano de migracao de ate 18 meses para componentes criticos.

### 3. Technology Adoption Process (TAP)
- Nenhuma tecnologia nova entra em producao sem passar pelo TAP: Discovery → Assessment → POC (12 semanas max) → ARB Approval → Production.

### 4. Annual Architecture Review
- Obrigatoriedade de conducao de uma revisao arquitetural completa em dezembro de cada ano, recalculando o Technology Obsolescence Index (TOI) e o Maintainability Index (MI) para 100% da stack.

## Consequencias
- Positivas: Impedimento continuo de obsolescencia, visibilidade corporativa da divida tecnica, inovacao previsivel e sustentavel.
- Restricoes: Exige disciplina estrita do PMO para nao consumir os 20% reservados para divida tecnica com novas demandas de produto.
