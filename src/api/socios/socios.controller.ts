import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { SociosService } from './socios.service';
import { CreateSocioDto } from './dto/create.socio.dto';
import { UpdateSocioDto } from './dto/update.socio.dto';
import { ApiTags } from '@nestjs/swagger';
import { ReporteInscriptosMesDto } from './dto/reporte.inscriptos.mes.dto';

@ApiTags('Socios')
@Controller({ path: 'socios', version: '1' })
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  @Post()
  create(@Body() createSocioDto: CreateSocioDto, @Res() res) {
    this.sociosService
      .create(createSocioDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => {
        res.status(400).send({ error: error.message ? error.message : error });
      });
  }

  @Get('organizacion/:idOrganizacion')
  findByOrganizacion(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    this.sociosService
      .findByOrg(idOrganizacion)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('organizacion/:idOrganizacion/backup')
  async backupSocios(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    try {
      const csv = await this.sociosService.backupSociosByOrg(idOrganizacion);
      const buffer = Buffer.from('' + csv, 'utf-8');
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="backup.csv"',
      });
      return new StreamableFile(buffer);
    } catch (e) {
      return res.status(400).send({ error: e });
    }
  }

  @Post('organizacion/:idOrganizacion/backup')
  async restoreSocios(
    @Param('idOrganizacion') idOrganizacion: string,
    @Body() csvArray: string[][],
    @Res({ passthrough: true }) res,
  ) {
    this.sociosService
      .restoreSociosOrg(csvArray)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => {
        res.status(400).send({ error: error.message ? error.message : error });
      });
  }

  @Get('organizacion/:idOrganizacion/deudores')
  findDeudoresByOrganizacion(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    this.sociosService
      .findDeudoresByOrg(idOrganizacion)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('actividad/turno/:idTurnoActividad')
  findByTurnoActividad(
    @Param('idTurnoActividad') idTurnoActividad: string,
    @Res() res,
  ) {
    this.sociosService
      .findByTurnoActividad(idTurnoActividad)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('actividad/:idActividad')
  findByActividad(@Param('idActividad') idActividad: string, @Res() res) {
    this.sociosService
      .findByActividad(idActividad)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('usuario/:idUsuario')
  findBySocio(@Param('idUsuario') idUsuario: string, @Res() res) {
    this.sociosService
      .findByUser(idUsuario)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res) {
    this.sociosService
      .findOne(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSocioDto: UpdateSocioDto) {
    return this.sociosService.update(+id, updateSocioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res) {
    return this.sociosService
      .remove(id)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error: error.message }));
  }

  @Post('reporte/inscriptos-mes')
  reporteSociosPorMes(@Body() dto: ReporteInscriptosMesDto, @Res() res) {
    this.sociosService
      .inscriptosPorMes(dto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('reporte/rango-etario/:idOrg')
  reporteRangoEtarioSocios(@Param('idOrg') idOrg: string, @Res() res) {
    this.sociosService
      .rangoEtarioSociosOrganizacion(idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('reporte/distribucion-estados/:idOrg')
  reporteEstadoSocios(@Param('idOrg') idOrg: string, @Res() res) {
    this.sociosService
      .sociosPorEstadoOrganizacion(idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
