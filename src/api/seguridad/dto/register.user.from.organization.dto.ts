import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { DomicilioDto } from '../../../common/dto/domicilio.dto';

export class RegisterFromOrgDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  dni: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono: string;

  @ApiProperty()
  @IsDateString()
  fechaNacimiento: Date;

  @ApiProperty({ type: DomicilioDto })
  @ValidateNested()
  @Type(() => DomicilioDto)
  domicilio: DomicilioDto;

  @ApiProperty()
  @IsUUID()
  idTurnoActividad: string;
}
