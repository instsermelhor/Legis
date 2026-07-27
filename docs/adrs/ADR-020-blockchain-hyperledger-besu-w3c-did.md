# ADR-020: Seleção da Rede Hyperledger Besu para Infraestrutura Blockchain e Identidade W3C
Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Blockchain Officer, Enterprise Architect, CISO

## Contexto
A Legis Connect precisa de uma rede DLT enterprise de alto desempenho, compatível com a Ethereum Virtual Machine (EVM),
com custo de transação zero ou previsível (Private Gas Model), suporte a transações privadas e capacidade de interoperar
com a Web3 global para chancela de integridade documental, contratos inteligentes e credenciais verificáveis (W3C VC).

## Opções Avaliadas
| Plataforma DLT | Compatibilidade EVM | Modelo de Privacidade | Custo de Transação | Decisão |
|---|---|---|---|---|
| Hyperledger Fabric | Não (Go/Java Chaincode) | Channels Privados | Nulo (Permissioned) | Descartada |
| Ethereum Mainnet Pública | Sim (Nativa) | Baixo (Público) | Altíssimo (Gas Volátil) | Descartada |
| **Hyperledger Besu (EVM Enterprise)** | **Sim (Nativa EVM)** | **Excelente (Tessera)** | **Zero (Private Gas)** | **ESCOLHIDA** |

## Decisão
Adotar **Hyperledger Besu (EVM Permissioned Enterprise)** como a rede primária da Legis Connect:
1. **Consenso IBFT 2.0**: Finalidade instantânea de blocos (1 segundo) e alta capacidade (> 2.000 TPS).
2. **Ancoragem em L2 Pública (Polygon / Arbitrum)**: Hash de checkpoint dos blocos ancorado diariamente na L2 pública para garantia de imutabilidade externa.
3. **Contratos e Tokens EVM**: Suporte nativo ao OpenZeppelin (ERC-20, ERC-721, ERC-1155, ERC-3643).
4. **Padrões W3C**: Suporte nativo a W3C Decentralized Identity (`did:legis`) e Verifiable Credentials (VC v1.1).

## Consequências
- Positivas: Autonomia operacional total, zero custo por transação para os clientes e total rastreabilidade criptográfica.
- Mitigações: Manutenção de nós contadores em cluster Kubernetes de produção com monitoramento constante de latência de consenso.
