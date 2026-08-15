import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { TokenService } from '@core/services/token.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let tokenService: { isTokenValid: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    tokenService = { isTokenValid: vi.fn() };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: TokenService, useValue: tokenService },
        { provide: Router, useValue: router },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/cart' } as RouterStateSnapshot;
  });

  it('should allow access when token is valid', () => {
    tokenService.isTokenValid.mockReturnValue(true);

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /auth/login with returnUrl when token is invalid', () => {
    tokenService.isTokenValid.mockReturnValue(false);
    state = { url: '/cart' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/auth/login'],
      { queryParams: { returnUrl: '/cart' } }
    );
  });

  it('should capture full URL including nested paths', () => {
    tokenService.isTokenValid.mockReturnValue(false);
    state = { url: '/orders/123' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/auth/login'],
      { queryParams: { returnUrl: '/orders/123' } }
    );
  });
});
