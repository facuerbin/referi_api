import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../entities/rol.entity';

export class CreatePersonalDto {
  @ApiProperty()
  emailUsuario: string;

  @ApiProperty()
  rol: string;
}
