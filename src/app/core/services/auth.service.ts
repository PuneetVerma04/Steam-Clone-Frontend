import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '@environments/environment';
import { AuthResponse, LoginDto, RegisterDto } from '@core/models/auth.model';
import { TokenService } from '@core/services/token.service';
import { CartService } from '@core/services/cart.service';

/**
 * JWT payload shape from .NET JwtSecurityTokenHandler.
 * Claim keys follow the .NET short-name convention:
 *   unique_name = username, role = user role, exp = expiry timestamp
 * MEDIUM confidence — verify by logging jwtDecode(token) on first real backend call.
 */
interface JwtPayload {
  nameid: string;
  unique_name: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Initialized in constructor — field initializer runs before DI injects dependencies
  readonly currentUser$: BehaviorSubject<AuthResponse | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly tokenService: TokenService,
    private readonly cartService: CartService
  ) {
    this.currentUser$ = new BehaviorSubject<AuthResponse | null>(this.loadUserFromStorage());
  }

  /**
   * Reads token from localStorage on construction and attempts to decode it.
   * Returns null if token is missing, expired, or malformed.
   */
  private loadUserFromStorage(): AuthResponse | null {
    if (!this.tokenService.isTokenValid()) {
      return null;
    }
    const token = this.tokenService.getToken();
    if (!token) {
      return null;
    }
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return { token, username: payload.unique_name, role: payload.role };
    } catch {
      return null;
    }
  }

  /**
   * Authenticate user with email + password.
   * Login endpoint returns { token, username, role } directly — no JWT decode needed.
   */
  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => {
        this.tokenService.setToken(response.token);
        this.currentUser$.next(response);
      })
    );
  }

  /**
   * Register a new user.
   * Register endpoint returns { token } only — JWT must be decoded for username/role.
   */
  register(dto: RegisterDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/register`, dto).pipe(
      tap(response => {
        this.tokenService.setToken(response.token);
        const payload = jwtDecode<JwtPayload>(response.token);
        const authResponse: AuthResponse = {
          token: response.token,
          username: payload.unique_name,
          role: payload.role,
        };
        this.currentUser$.next(authResponse);
      })
    );
  }

  /**
   * Clear session: remove token from storage, reset state, navigate to games catalog.
   */
  logout(): void {
    this.tokenService.clearToken();
    this.currentUser$.next(null);
    this.cartService.clearCart();  // AUTH-04: reset cart badge on logout (T-04-03 mitigation)
    this.router.navigate(['/games']);
  }

  /**
   * Convenience wrapper — delegates to TokenService for guard use.
   */
  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }
}
