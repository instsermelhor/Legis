export interface AIAgentIdentity {
  agentUcid: string;
  agentName: string;
  owningTenantId: string;
  allowedScopes: string[];
  maxDailyExecutionBudget: number;
  isAutonomous: boolean;
}
