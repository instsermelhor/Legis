export class LegalCase {
  constructor(
    public readonly id: string,
    public readonly cnjNumber: string,
    public readonly clientUcid: string,
    public lawyerUcid: string,
    public readonly tenantId: string,
    public courtJurisdiction: string,
    public status: 'TRIAGE' | 'DISTRIBUTED' | 'ACTIVE' | 'SETTLED' | 'ARCHIVED',
    public readonly createdAt: Date,
  ) {}
}
