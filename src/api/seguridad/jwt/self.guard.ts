import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// Runs after JwtAuthGuard, which populates request.user.
@Injectable()
export class SelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const targetId = request.params?.id;

    if (!userId) throw new UnauthorizedException();

    if (!targetId || userId !== targetId) {
      throw new ForbiddenException('No puede operar sobre otro usuario');
    }

    return true;
  }
}
