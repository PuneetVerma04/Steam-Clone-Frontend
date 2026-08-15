import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

// Minimal valid JWT with nameid=42 — header.payload.signature (HS256, unsigned stub)
// Payload (base64url): { "nameid": "42", "unique_name": "player", "role": "Player", "exp": 9999999999 }
const MOCK_JWT =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ nameid: '42', unique_name: 'player', role: 'Player', exp: 9999999999 }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') +
  '.fake-signature';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TokenService] });
    service = TestBed.inject(TokenService);
    localStorage.clear();
  });

  afterEach(() => { localStorage.clear(); });

  describe('getUserId()', () => {
    it('returns null when no token is stored', () => {
      expect(service.getUserId()).toBeNull();
    });

    it('returns numeric userId from nameid claim', () => {
      service.setToken(MOCK_JWT);
      const id = service.getUserId();
      expect(id).toBe(42);
    });

    it('returns null when token is malformed', () => {
      service.setToken('not.a.jwt');
      expect(service.getUserId()).toBeNull();
    });
  });
});
