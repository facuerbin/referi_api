import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePersonalDto {
  @ApiProperty()
  @IsEmail()
  emailUsuario: string;

  // Matched against Rol.nombre case-insensitively by the service.
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rol: string;
}
