# ADR-022: Estrategia de Migracao para Criptografia Pos-Quantica (PQC) e Crypto Agility Architecture
# Status: APROVADO | Data: 27/07/2026 | Decisores: CTO, CISO, Chief Blockchain Officer, Chief Innovation Officer

## Contexto
A ameaca concreta do ataque "Harvest Now, Decrypt Later" (HNDL) implica que adversarios ja interceptam
comunicacoes criptografadas com RSA/ECDSA para decifrar quando computadores quanticos atingirem maturidade
(Q-Day estimado: 2030-2040). A Legis Connect armazena contratos e evidencias com vida util de 20-30 anos
que precisam permanecer confidenciais alem do Q-Day. A inacao hoje e equivalente a um breach futuro garantido.

## Algoritmos Avaliados (NIST PQC Round 4 Final - 2024)

| Finalidade | Opcao A | Opcao B (ESCOLHIDA) | Justificativa |
|---|---|---|---|
| Key Encapsulation (KEM) | McEliece (code-based) | **CRYSTALS-Kyber (FIPS 203)** | Chaves 800x menores, padrao NIST |
| Assinatura Digital | Rainbow (quebrado em 2022) | **CRYSTALS-Dilithium (FIPS 204)** | Unico algoritmo nao quebrado no NIST |
| Assinatura Alternativa | GeMSS (lento) | **SPHINCS+ (FIPS 205)** | Hash-based, sem dependencia de reticulados |

## Decisao
Adotar **Crypto Agility Architecture** com migracao faseada para PQC:

1. **Crypto Agility Layer**: Abstraction layer que roteia chamadas criptograficas ao algoritmo correto
   por versao, contexto e nivel de seguranca — sem alterar codigo de aplicacao.
2. **Fase de Transicao Hibrida (2026-2027)**: TLS com Kyber768 + X25519 simultaneamente.
   JWT e documentos com Dilithium-3 + ECDSA simultaneamente (backward compatible).
3. **PQC-First (2027-2028)**: Dilithium-3 como algoritmo primario de assinatura.
   RSA e ECDSA apenas para compatibilidade com sistemas externos legados.
4. **Full PQC (2028+)**: Desativacao completa de RSA e ECDSA em sistemas internos.

## Consequencias
- Positivas: Imunidade a ataques HNDL, conformidade futura com NIST FIPS 203/204/205,
  posicionamento como lider de seguranca no mercado LegalTech.
- Mitigacoes: Overhead de performance de ~10-30% em operacoes criptograficas (aceitavel com GPU).
  Aguardar padronizacao ICP-Brasil PQC (previsto 2027) para assinaturas qualificadas nacionais.
