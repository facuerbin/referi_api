import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CreateOrganizacionDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacione.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Organizaciones')
@Controller({ path: 'organizaciones', version: '1' })
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Post()
  create(@Body() createOrganizacioneDto: CreateOrganizacionDto) {
    return this.organizacionesService.create(createOrganizacioneDto);
  }

  @Get()
  findAll() {
    return this.organizacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizacionesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizacioneDto: UpdateOrganizacionDto,
  ) {
    return this.organizacionesService.update(+id, updateOrganizacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizacionesService.remove(+id);
  }
}
