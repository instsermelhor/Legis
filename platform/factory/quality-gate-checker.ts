/**
 * Legis Connect — Automated Development Quality Gate Checker
 * Padrão: Development Quality Gates (Prompt 246 - Etapa 15)
 * Avaliação automatizada no pipeline CI/CD (GitHub Actions)
 */

export interface QualityGateResult {
  passed: boolean;
  coveragePct: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  maintainabilityIndex: number;
  dodChecklistComplete: boolean;
  reasons: string[];
}

export class QualityGateChecker {
  private static MIN_COVERAGE_PCT = 85.0;
  private static MIN_MAINTAINABILITY_INDEX = 70.0;
  private static MAX_CRITICAL_VULNERABILITIES = 0;
  private static MAX_HIGH_VULNERABILITIES = 0;

  public static async evaluateQualityGate(
    coveragePct: number,
    criticalVulns: number,
    highVulns: number,
    maintainabilityIndex: number,
    dodComplete: boolean
  ): Promise<QualityGateResult> {
    console.log('[QUALITY GATE CHECKER] Evaluating CI/CD Quality Gate rules...');

    const reasons: string[] = [];

    if (coveragePct < this.MIN_COVERAGE_PCT) {
      reasons.push(`Code coverage (${coveragePct}%) is below minimum requirement (${this.MIN_COVERAGE_PCT}%).`);
    }

    if (criticalVulns > this.MAX_CRITICAL_VULNERABILITIES) {
      reasons.push(`Found ${criticalVulns} critical security vulnerabilities. Allowed: ${this.MAX_CRITICAL_VULNERABILITIES}.`);
    }

    if (highVulns > this.MAX_HIGH_VULNERABILITIES) {
      reasons.push(`Found ${highVulns} high security vulnerabilities. Allowed: ${this.MAX_HIGH_VULNERABILITIES}.`);
    }

    if (maintainabilityIndex < this.MIN_MAINTAINABILITY_INDEX) {
      reasons.push(`Maintainability Index (${maintainabilityIndex}) is below threshold (${this.MIN_MAINTAINABILITY_INDEX}).`);
    }

    if (!dodComplete) {
      reasons.push(`Definition of Done (DoD) checklist is incomplete.`);
    }

    const passed = reasons.length === 0;

    console.log(`[QUALITY GATE CHECKER] Quality Gate Evaluation: ${passed ? 'PASSED (MERGE ALLOWED)' : 'FAILED (MERGE BLOCKED)'}`);

    return {
      passed,
      coveragePct,
      criticalVulnerabilities: criticalVulns,
      highVulnerabilities: highVulns,
      maintainabilityIndex,
      dodChecklistComplete: dodComplete,
      reasons,
    };
  }
}
