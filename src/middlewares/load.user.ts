import { Injectable, Logger, NestMiddleware, Req } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SeguridadService } from 'src/api/seguridad/seguridad.service';
import { UsuariosService } from 'src/api/usuarios/usuarios.service';

@Injectable()
export class LoadUserMiddleware implements NestMiddleware {
  constructor(
    private readonly seguridadService: SeguridadService,
    private readonly usuarioService: UsuariosService,
  ) {}
  async use(@Req() req: Request, res: Response, next: NextFunction) {
    const payload = this.seguridadService.decodeToken(
      req.headers.authorization.slice(7),
    );
    if (!req.headers.authorization || !payload.sub) next();
    const user = await this.usuarioService.findOne(payload.sub);
    req.body.user = user;
    next();
  }
}
