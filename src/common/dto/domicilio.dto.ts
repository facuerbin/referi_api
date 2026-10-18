import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

// No `id`: whitelist strips an incoming one, so a write can't be redirected.
export class DomicilioDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  calle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  numero?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  provincia?: string;
}
