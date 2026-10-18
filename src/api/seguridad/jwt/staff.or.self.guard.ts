import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PersonalOrganizacion } from '../../organizaciones/entities/personal.organizacion.entity';
import { Inscripcion } from '../../socios/entities/inscripcion.entity';

const PERMISO_SOCIOS = 'SOCIOS';

// Mirrors the panel's SociosGuard: self, or SOCIOS permission in the target's org.
@Injectable()
export class StaffOrSelfGuard implements CanActivate {
  constructor(
    @InjectRepository(PersonalOrganizacion)
    private personalRepository: Repository<PersonalOrganizacion>,
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const targetId = request.params?.id;

    if (!userId) throw new UnauthorizedException();
    if (!targetId) {
      throw new ForbiddenException('No puede consultar otro usuario');
    }
    if (userId === targetId) return true;

    const empleos = await this.personalRepository.find({
      where: { personal: { id: userId } },
      relations: { organizacion: true, rol: { permisos: true } },
    });

    const organizaciones = empleos
      .filter((empleo) =>
        empleo.rol?.permisos?.some(
          (permiso) => permiso.modulo === PERMISO_SOCIOS,
        ),
      )
      .map((empleo) => empleo.organizacion.id);

    if (!organizaciones.length) {
      throw new ForbiddenException('No puede consultar otro usuario');
    }

    const inscripciones = await this.inscripcionRepository.count({
      where: {
        usuario: { id: targetId },
        organizacion: { id: In(organizaciones) },
      },
      // Includes bajas so a former member's detail screen still works.
      withDeleted: true,
    });

    if (!inscripciones) {
      throw new ForbiddenException('El usuario no pertenece a su organización');
    }

    return true;
  }
}
