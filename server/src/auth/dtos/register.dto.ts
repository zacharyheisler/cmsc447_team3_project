import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  // Provide an existing company's ID -OR- a new company name — not both.
  @ValidateIf((o: RegisterDto) => !o.companyName)
  @IsInt()
  companyId?: number;

  @ValidateIf((o: RegisterDto) => !o.companyId)
  @IsString()
  @IsNotEmpty()
  companyName?: string;
}
