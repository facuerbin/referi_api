// import {
//   CallHandler,
//   ExecutionContext,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// import { map, Observable } from 'rxjs';
// import { SeguridadService } from 'src/api/seguridad/seguridad.service';
// import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
// import { UsuariosService } from 'src/api/usuarios/usuarios.service';

// @Injectable()
// export class LoadUserInterceptor implements NestInterceptor {
//   constructor(
//     private readonly seguridadService: SeguridadService,
//     private readonly usuarioService: UsuariosService,
//   ) {}

//   public intercept(
//     _context: ExecutionContext,
//     next: CallHandler,
//   ): Observable<Usuario> {
//     const payload = this.seguridadService.decodeToken(
//       req.headers.authorization.slice(7),
//     );
//     if (!req.headers.authorization || !payload.sub) next();
//     const user = await this.usuarioService.findOne(payload.sub);
//     req.body.user = user;
//     const request = _context.switchToHttp().getRequest();
//     if (request.body.name) {
//       request.body.name = 'modify request';
//     }

//     return request.body.user;
//   }
// }
