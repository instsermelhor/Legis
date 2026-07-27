# ADR-011: Metabase Enterprise como Plataforma BI Self-Service da Legis Connect
Status: APROVADO | Data: 27/07/2026 | Decisores: CDO, Chief Analytics Officer, CFO

## Contexto
Necessidade de BI self-service para 15+ analistas de negócio sem conhecimento SQL, com
embedding de dashboards no produto Legis (analytics para clientes), multi-tenancy com
Row-Level Security e integração SSO via SAML 2.0 com o Identity Service (ADR-001).

## Opções Avaliadas
| Ferramenta | Vantagem | Custo | Decisão |
|---|---|---|---|
| Metabase Enterprise | Self-service, embedding, RLS, open-source base | ~$500/mês | ESCOLHIDA |
| Tableau | Maturidade, visualizações ricas | $2.500+/mês | Descartada (custo) |
| Power BI | Integração Microsoft | $10/user/mês | Alternativa para executivos |
| Looker | Google Cloud native | $3.000+/mês | Descartada (custo) |

## Decisão
Metabase Enterprise conectado ao Amazon Redshift Serverless (Gold Layer).
Grafana para dashboards técnicos (SLO, SRE, DevOps). Power BI opcionalmente para board.
