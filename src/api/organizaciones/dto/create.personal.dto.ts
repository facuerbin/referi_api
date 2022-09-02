import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonalDto {
  @ApiProperty()
  emailUsuario: string;

  @ApiProperty()
  rol: string;
}
