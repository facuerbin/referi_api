import { ApiProperty } from '@nestjs/swagger';
import { UsuarioSinPasswordSchema } from '../../seguridad/response/auth.response.dto';

export class UsuarioResponseSchema {
  @ApiProperty({ type: () => UsuarioSinPasswordSchema })
  data: UsuarioSinPasswordSchema;
}
