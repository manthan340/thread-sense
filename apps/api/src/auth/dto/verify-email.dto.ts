import { IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  token!: string;
}
