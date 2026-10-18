import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgStaffGuard } from './org.staff.guard';

const contextFor = (request: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => null,
    getClass: () => null,
  }) as unknown as ExecutionContext;

const guardWith = (empleo: unknown, modulo?: string) => {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(modulo),
  } as unknown as Reflector;

  return new OrgStaffGuard(reflector, {
    findOne: jest.fn().mockResolvedValue(empleo),
  } as never);
};

const conAsistencia = {
  organizacion: { id: 'org-1' },
  rol: { permisos: [{ modulo: 'ASISTENCIA' }] },
};

describe('OrgStaffGuard', () => {
  it('allows staff holding the required permission in that organización', async () => {
    const guard = guardWith(conAsistencia, 'ASISTENCIA');
    const context = contextFor({
      user: { userId: 'staff-1' },
      params: { idOrg: 'org-1' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('reads the organización from the body when the route has no :idOrg', async () => {
    const guard = guardWith(conAsistencia, 'ASISTENCIA');
    const context = contextFor({
      user: { userId: 'staff-1' },
      params: {},
      body: { idOrg: 'org-1' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects a caller who is not staff of that organización', async () => {
    const guard = guardWith(null, 'ASISTENCIA');
    const context = contextFor({
      user: { userId: 'outsider' },
      params: { idOrg: 'org-1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects staff whose rol lacks the required permission', async () => {
    const guard = guardWith(
      {
        organizacion: { id: 'org-1' },
        rol: { permisos: [{ modulo: 'PAGOS' }] },
      },
      'ASISTENCIA',
    );
    const context = contextFor({
      user: { userId: 'contable-1' },
      params: { idOrg: 'org-1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('accepts any staff membership when the route names no permission', async () => {
    const guard = guardWith({
      organizacion: { id: 'org-1' },
      rol: { permisos: [{ modulo: 'PAGOS' }] },
    });
    const context = contextFor({
      user: { userId: 'contable-1' },
      params: { idOrg: 'org-1' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('fails closed when no organización is present in the request', async () => {
    const guard = guardWith(conAsistencia, 'ASISTENCIA');
    const context = contextFor({ user: { userId: 'staff-1' }, params: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects the request when no authenticated user is attached', async () => {
    const guard = guardWith(conAsistencia, 'ASISTENCIA');
    const context = contextFor({ params: { idOrg: 'org-1' } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
