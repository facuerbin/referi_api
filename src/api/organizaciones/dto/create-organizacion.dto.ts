import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DomicilioDto } from '../../../common/dto/domicilio.dto';

export class CreateOrganizacionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ type: DomicilioDto })
  @ValidateNested()
  @Type(() => DomicilioDto)
  direccion: DomicilioDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tipoOrganizacion: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
