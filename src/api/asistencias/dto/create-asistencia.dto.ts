import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAsistenciaDto {
  @ApiProperty()
  @IsUUID()
  idOrg: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  hora?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellido?: string;

  // When present the socio is resolved by email; otherwise it's a walk-in.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  emailUsuario?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dni?: number;
}
