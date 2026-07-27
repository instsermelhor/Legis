export class Lawyer {
  constructor(
    public readonly ucid: string,
    public readonly oabNumber: string,
    public readonly oabState: string,
    public readonly fullName: string,
    public readonly specialties: string[],
    public ratingScore: number,
    public isVerified: boolean,
    public readonly createdAt: Date,
  ) {}

  public verifyCredentials(isValidCfoab: boolean): void {
    if (!isValidCfoab) {
      throw new Error('Credenciais da OAB inválidas junto ao cadastro nacional');
    }
    this.isVerified = true;
  }
}
