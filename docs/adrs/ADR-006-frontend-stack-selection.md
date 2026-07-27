# ADR-006: Seleção do Framework Frontend Next.js 15 (React 19) e TailwindCSS
Status: APROVADO
Data: 27/07/2026
Decisores: CXO, Frontend Architect, Lead Designer

## Contexto
Necessidade de uma plataforma frontend de alta performance (LCP < 1.8s), acessível (WCAG 2.2 AA),
multi-dispositivo e integrada nativamente com componentes cognitivos de IA.

## Decisão
Adotar o Next.js 15 com React 19 Server Components, TypeScript estrito, Zustand para gerenciamento de estado,
TanStack Query para sincronização de dados e TailwindCSS + Vanilla CSS para o Legis Design System 3.0.

## Consequências
- Positivas: LCP < 1.8s, excelente SEO, bundle JS mínimo e desacoplamento total entre componentes visuais.
