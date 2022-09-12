import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @MinLength(8)
  @MaxLength(20)
  @ApiProperty()
  password: string;
}
