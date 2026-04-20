import { IsDate, IsEmail, IsInt, IsString } from 'class-validator';

export class ProfileDto {
  @IsInt()
  userId!: number;

  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phoneNumber!: string;

  @IsInt()
  companyId!: number;

  @IsDate()
  accountCreated!: Date;
}
