import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.auth.guard';

const context = () =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  it('lets a @Public() route through without authenticating', () => {
    const reflector = { getAllAndOverride: () => true } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(context())).toBe(true);
  });

  it('defers to passport when the route is not marked public', () => {
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);
    const passport = jest
      .spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)) as JwtAuthGuard,
        'canActivate',
      )
      .mockReturnValue(true as never);

    guard.canActivate(context());

    expect(passport).toHaveBeenCalled();
    passport.mockRestore();
  });
});
