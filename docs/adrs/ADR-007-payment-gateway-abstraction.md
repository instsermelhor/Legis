# ADR-007: Implementação do Padrão Adapter para Abstração de Gateways de Pagamento
Status: APROVADO
Data: 27/07/2026
Decisores: CFTO, Enterprise Finance Architect, CISO

## Contexto
Necessidade de eliminar dependência de adquirente único, suportar múltiplos métodos regionais (PIX, Cartão, Boleto)
e garantir failover transparente em tempo real entre Stripe, Pagar.me e Adyen.

## Decisão
Criar uma interface unificada `PaymentGatewayPort` no NestJS, permitindo alternar de forma transparente
entre Stripe, Pagar.me e Adyen sem alterar as regras de negócio de cobrança ou faturamento.

## Consequências
- Positivas: Eliminação de dependência de adquirente único, negociação de taxas e failover em tempo real.
