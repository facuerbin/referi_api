import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  // Numeric on the wire; the service stringifies it before comparing.
  @ApiProperty()
  @IsInt()
  code: number;
}
