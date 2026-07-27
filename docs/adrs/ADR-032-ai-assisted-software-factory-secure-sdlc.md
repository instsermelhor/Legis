# ADR-032: AI-Assisted Software Factory, Secure SDLC & Automated Quality Gates
# Status: APROVADO | Data: 27/07/2026 | Decisores: VP of Engineering, Chief Software Architect, Head of Platform Engineering, Chief Quality Officer, CISO

## Contexto
Com a autorização para início da construção física da Legis Connect (Prompt 245), é necessário estabelecer o modelo industrial de engenharia de software para suportar 67 engenheiros em 9 squads simultâneos. O desafio é manter alta velocidade de entrega (DORA Elite Performance) sem comprometer os rígidos padrões de segurança Zero Trust, qualidade de código e conformidade regulatória.

## Decisões Técnicas

### 1. Adoção de Desenvolvimento Assistido por IA com Governança
- Homologar o uso do **GitHub Copilot Enterprise** e do **Claude 3.5 Code Review Bot** para aceleração de geração de código boilerplate, documentação JSDoc e testes unitários.
- **Validação Humana Mandatória:** Todo código gerado por IA passa obrigatoriamente pela validação e aprovação de no mínimo 2 revisores humanos (Tech Lead + Peer Engineer).

### 2. Implementação do Secure SDLC (DevSecOps)
- Integrar ferramentas automatizadas em todas as fases do pipeline:
  - Coding: Git-secrets e verificação de segredos.
  - Pull Request: Trivy e Snyk (SAST e Dependency Scanning).
  - Build: Geração de SBOM (CycloneDX) e scanning de imagens de contêiner.
  - Staging: Dynamic Application Security Testing (DAST via OWASP ZAP).

### 3. Portões de Qualidade Automatizados (Quality Gates)
- Estabelecer a obrigatoriedade de aprovação automática nos Quality Gates no CI/CD (GitHub Actions):
  - Cobertura de testes unitários e de integração **>= 85%**.
  - Zero vulnerabilidades críticas ou altas no SAST/Snyk.
  - Índice de Manutenibilidade (SonarQube) **>= 70/100**.
  - Cumprimento total da Definition of Done (DoD).

### 4. Padrão Git Trunk-Based com Short-Lived Feature Branches
- Adotar Trunk-Based Development com feature branches com duração máxima de 2 dias e histórico linear (Rebase & Merge / Squash & Merge).

## Consequências
- Positivas: Previsibilidade industrial, aumento de 40% na velocidade de codificação com auxílio de IA, eliminação preventiva de vulnerabilidades antes de produções.
- Mitigações: Treinamento contínuo das equipes nos testes automatizados e rituais do DoR/DoD.
