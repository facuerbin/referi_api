import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalOrganizacion } from '../../organizaciones/entities/personal.organizacion.entity';

export const PERMISO_ORGANIZACION_KEY = 'permisoOrganizacion';

// Without this, any staff membership is enough.
export const PermisoOrganizacion = (modulo: string) =>
  SetMetadata(PERMISO_ORGANIZACION_KEY, modulo);

// Reads the organización from `:idOrg` or from `idOrg` in the body.
@Injectable()
export class OrgStaffGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(PersonalOrganizacion)
    private personalRepository: Repository<PersonalOrganizacion>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) throw new UnauthorizedException();

    const orgId = request.params?.idOrg ?? request.body?.idOrg;
    if (!orgId) {
      throw new ForbiddenException('Falta la organización de la solicitud');
    }

    const empleo = await this.personalRepository.findOne({
      where: { personal: { id: userId }, organizacion: { id: orgId } },
      relations: { rol: { permisos: true } },
    });

    if (!empleo) {
      throw new ForbiddenException(
        'No pertenece al personal de esta organización',
      );
    }

    const modulo = this.reflector.getAllAndOverride<string>(
      PERMISO_ORGANIZACION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      modulo &&
      !empleo.rol?.permisos?.some((permiso) => permiso.modulo === modulo)
    ) {
      throw new ForbiddenException(`Requiere el permiso ${modulo}`);
    }

    return true;
  }
}
