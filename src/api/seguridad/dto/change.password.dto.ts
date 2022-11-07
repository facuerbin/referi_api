import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  oldPassword: string;

  @ApiProperty()
  newPassword: string;
}
