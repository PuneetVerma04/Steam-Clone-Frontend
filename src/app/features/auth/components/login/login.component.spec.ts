import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    currentUser$: { getValue: ReturnType<typeof vi.fn> };
  };
  let routerMock: { navigateByUrl: ReturnType<typeof vi.fn> };
  let routeMock: { snapshot: { queryParams: Record<string, string> } };
  let notificationServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      currentUser$: { getValue: vi.fn().mockReturnValue(null) },
    };
    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };
    routeMock = {
      snapshot: { queryParams: { returnUrl: '/cart' } },
    };
    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2
  it('should have a reactive form with email and password controls', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  // Test 3
  it('should mark email as invalid when empty and touched', () => {
    const emailControl = component.loginForm.get('email')!;
    emailControl.markAsTouched();
    emailControl.setValue('');
    expect(emailControl.hasError('required')).toBe(true);
  });

  // Test 4
  it('should mark email as invalid for bad format', () => {
    const emailControl = component.loginForm.get('email')!;
    emailControl.setValue('notanemail');
    emailControl.markAsTouched();
    expect(emailControl.hasError('email')).toBe(true);
  });

  // Test 5
  it('should call AuthService.login() with form values on valid submit', () => {
    authServiceMock.login.mockReturnValue(
      of({ token: 'x', username: 'john', role: 'Player' })
    );
    component.loginForm.setValue({ email: 'john@test.com', password: 'secret123' });
    component.onSubmit();
    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'john@test.com',
      password: 'secret123',
    });
  });

  // Test 6
  it('should set serverError on HTTP error response', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: 'Invalid password' }))
    );
    component.loginForm.setValue({ email: 'john@test.com', password: 'wrong' });
    component.onSubmit();
    expect(component.serverError).toBe('Invalid password');
  });

  // Test 7
  it('should clear serverError when user edits a field after error', () => {
    component.serverError = 'Some error';
    component.loginForm.get('email')!.setValue('new@test.com');
    expect(component.serverError).toBeNull();
  });

  // Test 8
  it('should navigate to returnUrl after successful login', () => {
    authServiceMock.login.mockReturnValue(
      of({ token: 'x', username: 'john', role: 'Player' })
    );
    component.loginForm.setValue({ email: 'john@test.com', password: 'secret123' });
    component.onSubmit();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/cart');
  });

  // Test 9: no returnUrl in route → defaults to /games
  it('should navigate to /games when no returnUrl is present', async () => {
    routeMock.snapshot.queryParams = {};
    const fixture2 = TestBed.createComponent(LoginComponent);
    const comp2 = fixture2.componentInstance;
    fixture2.detectChanges();

    authServiceMock.login.mockReturnValue(
      of({ token: 'x', username: 'john', role: 'Player' })
    );
    comp2.loginForm.setValue({ email: 'john@test.com', password: 'secret123' });
    comp2.onSubmit();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/games');
  });

  // Test 10: T-02-01 open-redirect prevention
  it('should treat external returnUrl (starting with http) as /games', () => {
    routeMock.snapshot.queryParams = { returnUrl: 'http://evil.com' };
    const fixture3 = TestBed.createComponent(LoginComponent);
    const comp3 = fixture3.componentInstance;
    fixture3.detectChanges();
    expect((comp3 as any)['returnUrl']).toBe('/games');
  });
});
