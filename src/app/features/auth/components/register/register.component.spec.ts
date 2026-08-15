import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { RegisterComponent } from './register.component';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let authServiceMock: {
    register: ReturnType<typeof vi.fn>;
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
      register: vi.fn(),
      currentUser$: {
        getValue: vi.fn().mockReturnValue({ token: 'x', username: 'newuser', role: 'Player' }),
      },
    };
    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };
    routeMock = {
      snapshot: { queryParams: {} },
    };
    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent],
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

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2
  it('should have a reactive form with username, email, password, confirmPassword controls', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('username')).toBeTruthy();
    expect(component.registerForm.get('email')).toBeTruthy();
    expect(component.registerForm.get('password')).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')).toBeTruthy();
  });

  // Test 3
  it('should show password mismatch error when passwords differ and confirmPassword is touched', () => {
    component.registerForm.get('password')!.setValue('abcdef');
    component.registerForm.get('confirmPassword')!.setValue('xyz123');
    component.registerForm.get('confirmPassword')!.markAsTouched();
    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
  });

  // Test 4
  it('should NOT show password mismatch error when passwords match', () => {
    component.registerForm.get('password')!.setValue('abcdef');
    component.registerForm.get('confirmPassword')!.setValue('abcdef');
    expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
  });

  // Test 5
  it('should require password minimum 6 characters', () => {
    component.registerForm.get('password')!.setValue('12345');
    expect(component.registerForm.get('password')!.hasError('minlength')).toBe(true);
  });

  // Test 6
  it('should call AuthService.register() with form values on valid submit', () => {
    authServiceMock.register.mockReturnValue(of({ token: 'mockjwt' }));
    component.registerForm.setValue({
      username: 'newuser',
      email: 'new@test.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    component.onSubmit();
    expect(authServiceMock.register).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'new@test.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
  });

  // Test 7
  it('should call NotificationService.success() with welcome message after successful registration', () => {
    authServiceMock.register.mockReturnValue(of({ token: 'mockjwt' }));
    component.registerForm.setValue({
      username: 'newuser',
      email: 'new@test.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    component.onSubmit();
    expect(notificationServiceMock.success).toHaveBeenCalledWith(
      expect.stringContaining('Welcome to Gray Zone, newuser!')
    );
  });

  // Test 8
  it('should navigate to returnUrl after successful registration', () => {
    authServiceMock.register.mockReturnValue(of({ token: 'mockjwt' }));
    component.registerForm.setValue({
      username: 'newuser',
      email: 'new@test.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    component.onSubmit();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/games');
  });

  // Test 9
  it('should set serverError for duplicate email response', () => {
    authServiceMock.register.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: 'Email already registered' }))
    );
    component.registerForm.setValue({
      username: 'newuser',
      email: 'dup@test.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    component.onSubmit();
    expect(component.serverError).toBe('Email already registered');
  });

  // Test 10
  it('should clear serverError when user edits a field', () => {
    component.serverError = 'Some error';
    component.registerForm.get('email')!.setValue('changed@test.com');
    expect(component.serverError).toBeNull();
  });
});
