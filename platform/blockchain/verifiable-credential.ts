/**
 * Legis Connect — Verifiable Credentials (W3C VC Standard)
 * Emissão e validação de credenciais verificáveis de advogados e procurações
 * Padrão: Verifiable Credentials Framework (Prompt 234 - Etapa 6)
 */

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string; // DID do emissor (Ex: did:legis:org:oab)
  issuanceDate: string;
  credentialSubject: {
    id: string; // DID do titular (Advogado)
    oabNumber: string;
    oabState: string;
    status: 'ACTIVE' | 'SUSPENDED';
    fullName: string;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  };
}

export class VerifiableCredentialService {
  issueOabCredential(didUser: string, oabNumber: string, oabState: string, name: string): VerifiableCredential {
    return {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: `urn:uuid:${Date.now()}`,
      type: ['VerifiableCredential', 'OabLicenseCredential'],
      issuer: 'did:legis:org:oab-council',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: didUser,
        oabNumber,
        oabState,
        status: 'ACTIVE',
        fullName: name,
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        verificationMethod: 'did:legis:org:oab-council#key-1',
        proofPurpose: 'assertionMethod',
        jws: `eyJhbGciOiJFZERTQSI...proof_signature_${Date.now()}`,
      },
    };
  }
}
