import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NegocioService } from './negocio.service';
import { CreateNegocioDto } from './dto/create-negocio.dto';
import { UpdateNegocioDto } from './dto/update-negocio.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reglas de Negocio')
@Controller('negocio')
export class NegocioController {
  constructor(private readonly negocioService: NegocioService) {}

  @Post()
  create(@Body() createNegocioDto: CreateNegocioDto) {
    return this.negocioService.create(createNegocioDto);
  }

  @Get()
  findAll() {
    return this.negocioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.negocioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNegocioDto: UpdateNegocioDto) {
    return this.negocioService.update(+id, updateNegocioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.negocioService.remove(+id);
  }
}
