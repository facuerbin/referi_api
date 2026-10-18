import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DomicilioDto } from '../../../common/dto/domicilio.dto';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fotoPerfil: string;

  // Required: UsuariosService.create() reads its fields unconditionally.
  @ApiProperty({ type: DomicilioDto })
  @ValidateNested()
  @Type(() => DomicilioDto)
  domicilio: DomicilioDto;
}
