/**
 * Legis Connect — Autonomous Self-Healing Platform Engine
 * Padrão: Self-Healing Platform Architecture (Prompt 240 - Etapa 5)
 * Framework: SRE / Autonomous Operations Framework
 */

export enum HealingAction {
  RESTART_POD = 'RESTART_POD',
  SCALE_UP = 'SCALE_UP',
  CIRCUIT_BREAK = 'CIRCUIT_BREAK',
  ROLLBACK_DEPLOY = 'ROLLBACK_DEPLOY',
  SWITCH_PROVIDER = 'SWITCH_PROVIDER',
}

export interface SelfHealingRule {
  ruleId: string;
  metricTrigger: string;
  thresholdValue: number;
  healingAction: HealingAction;
  maxAutoRetries: number;
  requiresHumanApproval: boolean;
}

export interface HealingExecutionLog {
  executionId: string;
  ruleId: string;
  timestamp: Date;
  actionTaken: HealingAction;
  status: 'SUCCESS' | 'FAILED' | 'PENDING_HUMAN_APPROVAL';
  details: string;
}

export const SELF_HEALING_RULES: SelfHealingRule[] = [
  {
    ruleId: 'SH-001',
    metricTrigger: 'pod_crash_loop_backoff_count',
    thresholdValue: 3,
    healingAction: HealingAction.RESTART_POD,
    maxAutoRetries: 3,
    requiresHumanApproval: false,
  },
  {
    ruleId: 'SH-002',
    metricTrigger: 'http_5xx_error_rate_pct',
    thresholdValue: 5.0,
    healingAction: HealingAction.CIRCUIT_BREAK,
    maxAutoRetries: 1,
    requiresHumanApproval: false,
  },
  {
    ruleId: 'SH-003',
    metricTrigger: 'llm_provider_latency_p99_ms',
    thresholdValue: 8000,
    healingAction: HealingAction.SWITCH_PROVIDER,
    maxAutoRetries: 2,
    requiresHumanApproval: false,
  },
  {
    ruleId: 'SH-004',
    metricTrigger: 'deploy_error_rate_post_release_pct',
    thresholdValue: 3.0,
    healingAction: HealingAction.ROLLBACK_DEPLOY,
    maxAutoRetries: 1,
    requiresHumanApproval: false,
  },
];

export class SelfHealingEngine {
  private static globalKillSwitchActive = false;

  public static setGlobalKillSwitch(active: boolean): void {
    this.globalKillSwitchActive = active;
    console.warn(`[SELF-HEALING] Global Kill-Switch status: ${active ? 'ACTIVATED (ALL AUTO-HEALING HALTED)' : 'DEACTIVATED (NORMAL OPERATION)'}`);
  }

  public static async evaluateAndHeal(metricName: string, currentValue: number): Promise<HealingExecutionLog | null> {
    if (this.globalKillSwitchActive) {
      console.warn(`[SELF-HEALING] Automatic healing skipped due to Global Kill-Switch.`);
      return null;
    }

    const matchingRule = SELF_HEALING_RULES.find(r => r.metricTrigger === metricName && currentValue >= r.thresholdValue);
    if (!matchingRule) {
      return null;
    }

    console.log(`[SELF-HEALING] Triggered Rule ${matchingRule.ruleId} for metric ${metricName} (Value: ${currentValue})`);

    if (matchingRule.requiresHumanApproval) {
      return {
        executionId: `HEAL-EXEC-${Date.now()}`,
        ruleId: matchingRule.ruleId,
        timestamp: new Date(),
        actionTaken: matchingRule.healingAction,
        status: 'PENDING_HUMAN_APPROVAL',
        details: `Rule ${matchingRule.ruleId} requires human sign-off before executing ${matchingRule.healingAction}.`,
      };
    }

    const success = await this.executeAction(matchingRule.healingAction);

    return {
      executionId: `HEAL-EXEC-${Date.now()}`,
      ruleId: matchingRule.ruleId,
      timestamp: new Date(),
      actionTaken: matchingRule.healingAction,
      status: success ? 'SUCCESS' : 'FAILED',
      details: `Executed ${matchingRule.healingAction} automatically for metric ${metricName}. Result: ${success ? 'SUCCESS' : 'FAILED'}`,
    };
  }

  private static async executeAction(action: HealingAction): Promise<boolean> {
    console.log(`[SELF-HEALING EXECUTOR] Executing autonomous action: ${action}`);
    switch (action) {
      case HealingAction.RESTART_POD:
        return true;
      case HealingAction.CIRCUIT_BREAK:
        return true;
      case HealingAction.SWITCH_PROVIDER:
        return true;
      case HealingAction.ROLLBACK_DEPLOY:
        return true;
      case HealingAction.SCALE_UP:
        return true;
      default:
        return false;
    }
  }
}
