import { ApiProperty } from '@nestjs/swagger';
import { Domicilio } from '../entities/domicilio.entity';

// Every field is optional: PATCH only applies the properties actually present in
// the body. `password`, `verificado` and `dni` are deliberately absent — the
// service refuses to update them (password has its own endpoint, verificado is
// driven by email confirmation, and dni is identity data set at registration).
export class UpdateUsuarioDto {
  @ApiProperty({
    required: false,
    description:
      'Cambiar el email marca la cuenta como no verificada (verificado: false): la nueva dirección debe confirmarse antes de volver a estar verificada.',
  })
  email: string;

  @ApiProperty({ required: false })
  nombre: string;

  @ApiProperty({ required: false })
  apellido: string;

  @ApiProperty({ required: false })
  telefono: string;

  @ApiProperty({ required: false })
  fechaNacimiento: Date;

  @ApiProperty({ required: false })
  fotoPerfil: string;

  // Merged into the user's existing address row; an `id` here is ignored.
  @ApiProperty({ required: false, type: Domicilio })
  domicilio: Domicilio;
}
