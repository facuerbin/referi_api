import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { DomicilioDto } from '../../../common/dto/domicilio.dto';

export class UpdateOrganizacionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false, type: DomicilioDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DomicilioDto)
  direccion: DomicilioDto;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email: string;
}
