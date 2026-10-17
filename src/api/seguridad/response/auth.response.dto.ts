import { ApiProperty } from '@nestjs/swagger';
import { Domicilio } from '../../usuarios/entities/domicilio.entity';

export class UsuarioSinPasswordSchema {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty()
  dni: number;

  @ApiProperty({ required: false })
  telefono: string;

  @ApiProperty()
  verificado: boolean;

  @ApiProperty()
  fechaNacimiento: Date;

  @ApiProperty()
  fotoPerfil: string;

  @ApiProperty({ type: () => Domicilio })
  domicilio: Domicilio;

  @ApiProperty()
  fechaCreacion: Date;

  @ApiProperty()
  fechaActualizacion: Date;

  @ApiProperty({ required: false })
  fechaBaja: Date;
}

class LoginData {
  @ApiProperty({ type: () => UsuarioSinPasswordSchema })
  user: UsuarioSinPasswordSchema;

  @ApiProperty()
  access_token: string;
}

export class LoginResponseSchema {
  @ApiProperty({ type: () => LoginData })
  data: LoginData;
}

export class RegisterResponseSchema extends UsuarioSinPasswordSchema {
  @ApiProperty()
  access_token: string;
}
