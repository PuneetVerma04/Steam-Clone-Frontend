import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'aphelion_token';

interface AphelionJwtPayload {
  nameid: string;   // userId from .NET ClaimTypes.NameIdentifier — NOT 'sub'
  unique_name: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    // Basic expiry check — full JWT decode with jwt-decode added in Phase 2 when AuthService is built
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  /**
   * Extracts the userId from the stored JWT payload.
   * Uses the 'nameid' claim (not 'sub') — this backend emits nameid
   * from .NET's ClaimTypes.NameIdentifier.
   * Returns null if no token exists or decoding fails.
   */
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = jwtDecode<AphelionJwtPayload>(token);
      return Number(payload.nameid);
    } catch {
      return null;
    }
  }
}
