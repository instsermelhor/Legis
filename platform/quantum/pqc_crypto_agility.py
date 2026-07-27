"""
Legis Connect — Post-Quantum Cryptography Agility Layer
Camada de Agilidade Criptografica para transicao transparente entre algoritmos classicos e PQC
Padrao: NIST FIPS 203 (Kyber) / FIPS 204 (Dilithium) / FIPS 205 (SPHINCS+)
ADR: ADR-022 — Post-Quantum Cryptography Migration
Etapa: Prompt 236 — Etapa 6 (Crypto Agility) e Etapa 5 (PQC Migration)
"""

from enum import Enum
from typing import Optional


class CryptoAlgorithm(Enum):
    """Catalogo de algoritmos criptograficos suportados — classicos e pos-quanticos."""

    # Algoritmos Classicos (Em desuso gradual — vulneraveis a computadores quanticos)
    RSA_2048 = "rsa-2048"
    RSA_4096 = "rsa-4096"
    ECDSA_P256 = "ecdsa-p256"
    ECDSA_P384 = "ecdsa-p384"
    X25519 = "x25519"

    # Algoritmos Pos-Quanticos — NIST PQC Final Standards (2024)
    KYBER_512 = "crystals-kyber-512"     # FIPS 203 Level 1 (128-bit equiv.)
    KYBER_768 = "crystals-kyber-768"     # FIPS 203 Level 3 (192-bit equiv.) - RECOMENDADO
    KYBER_1024 = "crystals-kyber-1024"   # FIPS 203 Level 5 (256-bit equiv.)
    DILITHIUM_2 = "crystals-dilithium-2" # FIPS 204 Level 2 (128-bit equiv.)
    DILITHIUM_3 = "crystals-dilithium-3" # FIPS 204 Level 3 (192-bit equiv.) - RECOMENDADO
    DILITHIUM_5 = "crystals-dilithium-5" # FIPS 204 Level 5 (256-bit equiv.)
    SPHINCS_PLUS = "sphincs-plus-sha2-256s"  # FIPS 205 - Hash-based (estateful alternativo)

    # Algoritmos Hibridos (periodo de transicao — classico + PQC simultaneo)
    HYBRID_X25519_KYBER768 = "x25519kyber768"           # TLS KEM hibrido
    HYBRID_ECDSA_DILITHIUM3 = "ecdsa-p256-dilithium-3"  # Assinatura hibrida


class CryptoProfile(Enum):
    """Perfis de seguranca criptografica por fase de migracao e caso de uso."""
    CLASSICAL_LEGACY = "classical"     # RSA/ECDSA — sistemas legados externos
    HYBRID_TRANSITION = "hybrid"       # Classico + PQC simultaneo (2026-2027)
    POST_QUANTUM_PRIMARY = "pqc"       # PQC como primario (2027-2028)
    POST_QUANTUM_ONLY = "pqc_strict"   # Somente PQC (2028+)


class CryptoAgilityRouter:
    """
    Roteador central de Agilidade Criptografica da Legis Connect.

    Abstrai a selecao de algoritmo das aplicacoes — o codigo de negocio
    nunca referencia diretamente 'RSA' ou 'Kyber', apenas o perfil e o caso de uso.
    Isso permite substituir algoritmos sem alterar codigo de aplicacao.
    """

    # Configuracao da fase atual de migracao PQC (atualizada pelo SRE team)
    CURRENT_PHASE: CryptoProfile = CryptoProfile.HYBRID_TRANSITION  # Q4 2026

    # Matriz de selecao de algoritmo por caso de uso e perfil
    KEM_MATRIX = {
        CryptoProfile.CLASSICAL_LEGACY: CryptoAlgorithm.X25519,
        CryptoProfile.HYBRID_TRANSITION: CryptoAlgorithm.HYBRID_X25519_KYBER768,
        CryptoProfile.POST_QUANTUM_PRIMARY: CryptoAlgorithm.KYBER_768,
        CryptoProfile.POST_QUANTUM_ONLY: CryptoAlgorithm.KYBER_1024,
    }

    SIGNATURE_MATRIX = {
        CryptoProfile.CLASSICAL_LEGACY: CryptoAlgorithm.ECDSA_P256,
        CryptoProfile.HYBRID_TRANSITION: CryptoAlgorithm.HYBRID_ECDSA_DILITHIUM3,
        CryptoProfile.POST_QUANTUM_PRIMARY: CryptoAlgorithm.DILITHIUM_3,
        CryptoProfile.POST_QUANTUM_ONLY: CryptoAlgorithm.DILITHIUM_5,
    }

    def get_kem_algorithm(
        self,
        override_profile: Optional[CryptoProfile] = None
    ) -> CryptoAlgorithm:
        """Retorna o algoritmo KEM adequado para a fase atual de migracao PQC."""
        profile = override_profile or self.CURRENT_PHASE
        algorithm = self.KEM_MATRIX[profile]
        print(f"[CRYPTO AGILITY] KEM Algorithm Selected: {algorithm.value} (Profile: {profile.value})")
        return algorithm

    def get_signature_algorithm(
        self,
        use_case: str = "document",
        override_profile: Optional[CryptoProfile] = None
    ) -> CryptoAlgorithm:
        """
        Retorna o algoritmo de assinatura adequado.
        Casos de uso especiais (ex: contratos de longa vigencia) forcam nivel mais alto.
        """
        profile = override_profile or self.CURRENT_PHASE

        # Contratos com vigencia > 10 anos forcam Dilithium-5 (nivel maximo)
        if use_case in ["long_term_contract", "evidence_chain"]:
            algorithm = CryptoAlgorithm.DILITHIUM_5
        else:
            algorithm = self.SIGNATURE_MATRIX[profile]

        print(f"[CRYPTO AGILITY] Signature Algorithm: {algorithm.value} (Use Case: {use_case})")
        return algorithm

    def audit_crypto_inventory(self) -> dict:
        """Gera relatorio de inventario criptografico para auditoria PQC."""
        return {
            "current_phase": self.CURRENT_PHASE.value,
            "kem_in_use": self.get_kem_algorithm().value,
            "signature_in_use": self.get_signature_algorithm().value,
            "classical_algorithms_still_active": ["x25519", "ecdsa-p256"],
            "pqc_algorithms_active": ["crystals-kyber-768", "crystals-dilithium-3"],
            "estimated_full_pqc_date": "2028-Q1",
            "hndl_risk_level": "MEDIUM",  # Migracao em andamento
        }
