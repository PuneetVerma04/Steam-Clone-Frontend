import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { ErrorInterceptor } from './error.interceptor';
import { TokenService } from '@core/services/token.service';
import { NotificationService } from '@core/services/notification.service';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let clearTokenSpy: ReturnType<typeof vi.fn>;
  let notificationErrorSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateSpy = vi.fn().mockResolvedValue(true);
    clearTokenSpy = vi.fn();
    notificationErrorSpy = vi.fn();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: TokenService, useValue: { clearToken: clearTokenSpy, getToken: vi.fn() } },
        { provide: NotificationService, useValue: { error: notificationErrorSpy, success: vi.fn(), info: vi.fn(), warning: vi.fn() } },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should clear token and redirect to login on 401', () => {
    httpClient.get('/api/protected').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/protected');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(clearTokenSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should show Access denied toast on 403', () => {
    httpClient.get('/api/admin').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/admin');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(notificationErrorSpy).toHaveBeenCalledWith('Access denied');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should show generic error toast on 500', () => {
    httpClient.get('/api/broken').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/broken');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(notificationErrorSpy).toHaveBeenCalledWith('Something went wrong. Please try again.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should re-throw the error so callers can handle it', () => new Promise<void>((resolve) => {
    httpClient.get('/api/broken').subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
        resolve();
      },
    });

    const req = httpMock.expectOne('/api/broken');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  }));
});
