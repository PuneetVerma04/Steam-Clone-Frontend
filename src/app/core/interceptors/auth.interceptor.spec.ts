import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { AuthInterceptor } from './auth.interceptor';
import { TokenService } from '@core/services/token.service';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let getTokenSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getTokenSpy = vi.fn().mockReturnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: TokenService, useValue: { getToken: getTokenSpy } },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should add Authorization header when token exists', () => {
    getTokenSpy.mockReturnValue('test-jwt-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('should not add Authorization header when no token exists', () => {
    getTokenSpy.mockReturnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not modify the original request object', () => {
    getTokenSpy.mockReturnValue('test-jwt-token');
    const originalUrl = '/api/original';

    httpClient.get(originalUrl).subscribe();

    const req = httpMock.expectOne(originalUrl);
    expect(req.request.url).toBe(originalUrl);
    req.flush({});
  });
});
