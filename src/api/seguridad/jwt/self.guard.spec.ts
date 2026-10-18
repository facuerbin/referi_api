import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { SelfGuard } from './self.guard';

const contextFor = (request: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as ExecutionContext;

describe('SelfGuard', () => {
  const guard = new SelfGuard();

  it('allows the request when the token subject matches the :id param', () => {
    const context = contextFor({
      user: { userId: 'user-1' },
      params: { id: 'user-1' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects the request when acting on another user', () => {
    const context = contextFor({
      user: { userId: 'user-1' },
      params: { id: 'user-2' },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('fails closed when the route has no :id param', () => {
    const context = contextFor({ user: { userId: 'user-1' }, params: {} });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects the request when no authenticated user is attached', () => {
    const context = contextFor({ params: { id: 'user-1' } });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
