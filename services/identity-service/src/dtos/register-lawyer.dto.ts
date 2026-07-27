import { IsEmail, IsString, Matches, IsEnum } from 'class-validator';

export class RegisterLawyerDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos' })
  cpf: string;

  @IsString()
  oabNumber: string;

  @IsString()
  oabState: string;

  @IsEnum(['STANDARD', 'PREMIUM_PARTNER'])
  tier: string;
}
