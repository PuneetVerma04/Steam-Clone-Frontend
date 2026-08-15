import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
// describe/it/expect are Vitest globals — no import needed

import { GameService } from './game.service';
import { PagedGameResponse, Game } from '../models/game.model';

const MOCK_PAGED_RESPONSE: PagedGameResponse = {
  games: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 12,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false,
};

const MOCK_GAME: Game = {
  id: 42,
  title: 'Test Game',
  description: 'A test game',
  price: 19.99,
  genre: 'Action',
  imageUrl: 'https://example.com/image.jpg',
  releaseDate: '2024-01-01',
  publisherId: 1,
  publisherName: 'Test Publisher',
};

const BASE_URL = 'http://localhost:5062/store/games';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        GameService,
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(GameService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ---------------------------------------------------------------------------
  // Test 1: getGames() with no params — no query string appended
  // ---------------------------------------------------------------------------
  it('getGames() with no params sends GET /games with no query string', () => {
    service.getGames().subscribe();

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(MOCK_PAGED_RESPONSE);
  });

  // ---------------------------------------------------------------------------
  // Test 2: getGames() with genre, pageSize, pageNumber params
  // ---------------------------------------------------------------------------
  it('getGames({ genre, pageSize, pageNumber }) sends correct HttpParams', () => {
    service.getGames({ genre: 'Action', pageSize: 12, pageNumber: 2 }).subscribe();

    const req = httpMock.expectOne(r => r.url === BASE_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('genre')).toBe('Action');
    expect(req.request.params.get('pageSize')).toBe('12');
    expect(req.request.params.get('pageNumber')).toBe('2');
    req.flush(MOCK_PAGED_RESPONSE);
  });

  // ---------------------------------------------------------------------------
  // Test 3: getGames({ searchTerm: 'half life' }) URL-encodes searchTerm
  // ---------------------------------------------------------------------------
  it('getGames({ searchTerm }) URL-encodes searchTerm param', () => {
    service.getGames({ searchTerm: 'half life' }).subscribe();

    const req = httpMock.expectOne(r => r.url === BASE_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('searchTerm')).toBe('half life');
    req.flush(MOCK_PAGED_RESPONSE);
  });

  // ---------------------------------------------------------------------------
  // Test 4: getFeaturedGames() sends correct params for newest 5
  // ---------------------------------------------------------------------------
  it('getFeaturedGames() sends GET /games with sortBy=releaseDate&sortOrder=desc&pageSize=5', () => {
    service.getFeaturedGames().subscribe();

    const req = httpMock.expectOne(r => r.url === BASE_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('sortBy')).toBe('releaseDate');
    expect(req.request.params.get('sortOrder')).toBe('desc');
    expect(req.request.params.get('pageSize')).toBe('5');
    req.flush(MOCK_PAGED_RESPONSE);
  });

  // ---------------------------------------------------------------------------
  // Test 5: getGameById(42) sends GET /games/42
  // ---------------------------------------------------------------------------
  it('getGameById(42) sends GET /games/42', () => {
    service.getGameById(42).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/42`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_GAME);
  });

  // ---------------------------------------------------------------------------
  // Test 6: getGames({ minPrice: undefined }) does NOT include minPrice in query
  // ---------------------------------------------------------------------------
  it('getGames({ minPrice: undefined }) does NOT include minPrice in query string', () => {
    service.getGames({ minPrice: undefined }).subscribe();

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('minPrice')).toBe(false);
    req.flush(MOCK_PAGED_RESPONSE);
  });
});
