import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { TokenService } from '@core/services/token.service';
import { NotificationService } from '@core/services/notification.service';

// Build a minimal JWT for testing — header.payload.signature
function buildMockJwt(claims: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims));
  return `${header}.${payload}.fakesig`;
}

const VALID_JWT = buildMockJwt({
  nameid: '1',
  unique_name: 'testuser',
  role: 'Player',
  exp: Math.floor(Date.now() / 1000) + 3600,
});

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    setToken: ReturnType<typeof vi.fn>;
    clearToken: ReturnType<typeof vi.fn>;
    isTokenValid: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let notificationServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    tokenServiceMock = {
      getToken: vi.fn().mockReturnValue(null),
      setToken: vi.fn(),
      clearToken: vi.fn(),
      isTokenValid: vi.fn().mockReturnValue(false),
    };

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // -------------------------------------------------------------------------
  // Test 1: currentUser$ emits null when no token in localStorage
  // -------------------------------------------------------------------------
  it('currentUser$ emits null when no token', () => {
    // tokenServiceMock.isTokenValid returns false (set in beforeEach)
    expect(service.currentUser$.getValue()).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Test 2: currentUser$ emits decoded user when valid token exists
  // -------------------------------------------------------------------------
  it('currentUser$ emits decoded user when valid token exists', () => {
    tokenServiceMock.isTokenValid.mockReturnValue(true);
    tokenServiceMock.getToken.mockReturnValue(VALID_JWT);

    // Recreate service after mocking valid token state
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    const freshService = TestBed.inject(AuthService);
    const user = freshService.currentUser$.getValue();

    expect(user).not.toBeNull();
    expect(user?.username).toBe('testuser');
    expect(user?.role).toBe('Player');
    expect(user?.token).toBe(VALID_JWT);
  });

  // -------------------------------------------------------------------------
  // Test 3: login() calls POST to /store/auth/login, sets token, updates state
  // -------------------------------------------------------------------------
  it('login() calls POST to /store/auth/login, calls TokenService.setToken, updates currentUser$', () => {
    const dto = { email: 'test@test.com', password: 'pass123' };
    const responseData = { token: 'logintoken', username: 'john', role: 'Player' };

    let result: typeof responseData | null = null;
    service.login(dto).subscribe(res => (result = res));

    const req = httpMock.expectOne('http://localhost:5062/store/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(responseData);

    expect(tokenServiceMock.setToken).toHaveBeenCalledWith('logintoken');
    expect(service.currentUser$.getValue()).toEqual(responseData);
    expect(result).toEqual(responseData);
  });

  // -------------------------------------------------------------------------
  // Test 4: register() calls POST, sets token, decodes JWT, updates currentUser$
  // -------------------------------------------------------------------------
  it('register() calls POST to /store/auth/register, calls TokenService.setToken, decodes JWT, updates currentUser$', () => {
    const dto = {
      username: 'testuser',
      email: 'test@test.com',
      password: 'pass123',
      confirmPassword: 'pass123',
    };

    service.register(dto).subscribe();

    const req = httpMock.expectOne('http://localhost:5062/store/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ token: VALID_JWT });

    expect(tokenServiceMock.setToken).toHaveBeenCalledWith(VALID_JWT);
    const user = service.currentUser$.getValue();
    expect(user?.username).toBe('testuser');
    expect(user?.role).toBe('Player');
  });

  // -------------------------------------------------------------------------
  // Test 5: logout() clears token, resets currentUser$ to null, navigates to /games
  // -------------------------------------------------------------------------
  it('logout() calls clearToken(), resets currentUser$ to null, navigates to /games', () => {
    // Seed currentUser$ with a user first
    service.currentUser$.next({ token: 'tok', username: 'john', role: 'Player' });

    service.logout();

    expect(tokenServiceMock.clearToken).toHaveBeenCalled();
    expect(service.currentUser$.getValue()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/games']);
  });

  // -------------------------------------------------------------------------
  // Test 6: isAuthenticated() delegates to TokenService.isTokenValid()
  // -------------------------------------------------------------------------
  it('isAuthenticated() delegates to TokenService.isTokenValid()', () => {
    tokenServiceMock.isTokenValid.mockReturnValue(true);
    expect(service.isAuthenticated()).toBe(true);

    tokenServiceMock.isTokenValid.mockReturnValue(false);
    expect(service.isAuthenticated()).toBe(false);
  });
});
