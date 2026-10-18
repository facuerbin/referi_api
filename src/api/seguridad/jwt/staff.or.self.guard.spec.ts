import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { StaffOrSelfGuard } from './staff.or.self.guard';

const contextFor = (request: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as ExecutionContext;

const guardWith = (empleos: unknown[], inscripciones: number) =>
  new StaffOrSelfGuard(
    { find: jest.fn().mockResolvedValue(empleos) } as never,
    { count: jest.fn().mockResolvedValue(inscripciones) } as never,
  );

const conPermisoSocios = [
  {
    organizacion: { id: 'org-1' },
    rol: { permisos: [{ modulo: 'SOCIOS' }] },
  },
];

describe('StaffOrSelfGuard', () => {
  it('allows a user to read their own profile without hitting the database', async () => {
    const guard = guardWith([], 0);
    const context = contextFor({
      user: { userId: 'user-1' },
      params: { id: 'user-1' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('allows staff with SOCIOS permission to read a member of their organización', async () => {
    const guard = guardWith(conPermisoSocios, 1);
    const context = contextFor({
      user: { userId: 'staff-1' },
      params: { id: 'user-2' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects staff reading a user who belongs to no organización of theirs', async () => {
    const guard = guardWith(conPermisoSocios, 0);
    const context = contextFor({
      user: { userId: 'staff-1' },
      params: { id: 'user-2' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects staff whose rol lacks the SOCIOS permission', async () => {
    const guard = guardWith(
      [
        {
          organizacion: { id: 'org-1' },
          rol: { permisos: [{ modulo: 'PAGOS' }] },
        },
      ],
      1,
    );
    const context = contextFor({
      user: { userId: 'staff-1' },
      params: { id: 'user-2' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects a plain user reading another user', async () => {
    const guard = guardWith([], 1);
    const context = contextFor({
      user: { userId: 'user-1' },
      params: { id: 'user-2' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('fails closed when the route has no :id param', async () => {
    const guard = guardWith(conPermisoSocios, 1);
    const context = contextFor({ user: { userId: 'user-1' }, params: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects the request when no authenticated user is attached', async () => {
    const guard = guardWith(conPermisoSocios, 1);
    const context = contextFor({ params: { id: 'user-1' } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
