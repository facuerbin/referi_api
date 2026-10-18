import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DomicilioDto } from '../../../common/dto/domicilio.dto';

// `password`, `verificado` and `dni` are absent on purpose: whitelist strips them.
export class UpdateUsuarioDto {
  @ApiProperty({
    required: false,
    description:
      'Cambiar el email marca la cuenta como no verificada (verificado: false): la nueva dirección debe confirmarse antes de volver a estar verificada.',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellido: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaNacimiento: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fotoPerfil: string;

  @ApiProperty({ required: false, type: DomicilioDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DomicilioDto)
  domicilio: DomicilioDto;
}
