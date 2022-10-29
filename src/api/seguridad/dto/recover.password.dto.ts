import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RecoverPasswordDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
