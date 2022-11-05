import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { In, Repository } from 'typeorm';
import { Inscripcion } from '../socios/entities/inscripcion.entity';
import { SociosService } from '../socios/socios.service';
import { TarifasService } from '../tarifas/tarifas.service';
import { MedioDePago, RegistrarPagoDto } from './dto/registrar.pago.dto';
import { Cuota } from './entities/cuota.entity';
import { Pago } from './entities/pago.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Cuota)
    private cuotaRepository: Repository<Cuota>,
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @Inject(forwardRef(() => SociosService))
    private sociosService: SociosService,
    private tarifasService: TarifasService,
  ) {}
  async registrarPago(registrarPagoDto: RegistrarPagoDto) {
    const cuotas = await this.cuotaRepository.find({
      where: { id: In(registrarPagoDto.idsCuota) },
      relations: {
        inscripcion: {
          usuario: true,
          organizacion: true,
        },
      },
    });
    const user = cuotas[0].inscripcion.usuario;
    const org = cuotas[0].inscripcion.organizacion;
    return this.pagoRepository.save({
      fechaPago: new Date(),
      numeroComprobante: registrarPagoDto.numeroDeComprobante
        ? registrarPagoDto.numeroDeComprobante
        : null,
      medioDePago: MedioDePago[registrarPagoDto.medioDePago],
      usuario: user,
      organizacion: org,
      cuotas: cuotas,
    });
  }

  async consultarPagosInscripto(idInscripcion: string) {
    return this.pagoRepository.find({
      where: {
        cuotas: {
          inscripcion: {
            id: idInscripcion,
          },
        },
      },
    });
  }

  async consultarPagosOrganizacion(idOrganizacion: string) {
    return this.pagoRepository.find({
      where: {
        organizacion: {
          id: idOrganizacion,
        },
      },
    });
  }

  async consultarPagosUsuario(idUsuario: string) {
    return this.pagoRepository.find({
      where: {
        usuario: {
          id: idUsuario,
        },
      },
    });
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
      relations: {
        tarifa: {
          actividad: true,
        },
        pago: true,
        inscripcion: { usuario: true },
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
      relations: {
        tarifa: {
          actividad: true,
        },
        pago: true,
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
      relations: {
        tarifa: {
          actividad: true,
        },
        pago: true,
        inscripcion: { usuario: true },
      },
    });
  }

  findOne(id: string) {
    return this.pagoRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        organizacion: true,
        usuario: true,
        cuotas: {
          inscripcion: {
            turnoActividad: {
              actividad: true,
            },
          },
        },
      },
    });
  }
}
