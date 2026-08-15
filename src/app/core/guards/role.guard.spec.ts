import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '@core/services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: { currentUser$: { getValue: ReturnType<typeof vi.fn> } };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let route: any;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    authService = { currentUser$: { getValue: vi.fn() } };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    guard = TestBed.inject(RoleGuard);
    route = { data: { roles: ['Admin'] } } as any;
    state = {} as RouterStateSnapshot;
  });

  it('should allow access when user role matches', () => {
    authService.currentUser$.getValue.mockReturnValue({ token: 'x', username: 'admin', role: 'Admin' });

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /games when role does not match', () => {
    authService.currentUser$.getValue.mockReturnValue({ token: 'x', username: 'player', role: 'Player' });

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/games']);
  });

  it('should redirect to /games when no user is logged in', () => {
    authService.currentUser$.getValue.mockReturnValue(null);

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/games']);
  });

  it('should allow access when route has no roles defined', () => {
    authService.currentUser$.getValue.mockReturnValue({ token: 'x', username: 'player', role: 'Player' });
    route = { data: {} } as any;

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
