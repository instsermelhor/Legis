export class Invoice {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly userUcid: string,
    public readonly amount: number,
    public readonly currency: string,
    public status: 'DRAFT' | 'ISSUED' | 'PAID' | 'FAILED' | 'REFUNDED',
    public readonly dueDate: Date,
    public readonly createdAt: Date,
  ) {}

  public markAsPaid(): void {
    this.status = 'PAID';
  }
}
