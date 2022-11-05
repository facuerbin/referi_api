import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { In, Repository } from 'typeorm';
import { Inscripcion } from '../socios/entities/inscripcion.entity';
import { SociosService } from '../socios/socios.service';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import { TarifasService } from '../tarifas/tarifas.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Cuota } from './entities/cuota.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Cuota)
    private cuotaRepository: Repository<Cuota>,
    private usuariosService: UsuariosService,
    @Inject(forwardRef(() => SociosService))
    private sociosService: SociosService,
    private tarifasService: TarifasService,
  ) {}
  create(createPagoDto: CreatePagoDto) {
    return 'This action adds a new pago';
  }

  async createCuotas(inscripcion: Inscripcion) {
    const tarifas = await this.tarifasService.findByActividad(
      inscripcion.turnoActividad.actividad.id,
    );
    const cuotas: Cuota[] = [];
    const diasDeTolerancia = 3;

    tarifas.forEach(async (tarifa) => {
      const cuota = await this.cuotaRepository.save({
        inscripcion: inscripcion,
        tarifa: tarifa,
        monto: tarifa.monto,
        fechaVencimiento: moment().add(diasDeTolerancia, 'days').toDate(),
        periodoInicio: moment().toDate(),
        periodoFin: moment().add(tarifa.frecuencia.cantDias, 'days').toDate(),
      });
      cuotas.push(cuota);
    });

    return cuotas;
  }

  async consultarCuotasInscripto(idInscripcion: string) {
    return this.cuotaRepository.find({
      where: {
        inscripcion: { id: idInscripcion },
      },
    });
  }

  async consultarCuotasOrganizacion(idOrganizacion: string) {
    const inscriptos = await this.sociosService.findByOrg(idOrganizacion);
    const ids = inscriptos.map((inscripto) => {
      return inscripto.id;
    });
    return this.cuotaRepository.find({
      where: {
        inscripcion: { id: In(ids) },
      },
    });
  }

  async consultarCuotasUsuario(idUsuario: string) {
    const inscriptos = await this.sociosService.findByUser(idUsuario);
    const ids = inscriptos.map((inscripto) => {
      return inscripto.id;
    });
    return this.cuotaRepository.find({
      where: {
        inscripcion: { id: In(ids) },
      },
    });
  }

  findAll() {
    return `This action returns all pagos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return `This action updates a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }
}
