import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Game, GameQueryParameters, PagedGameResponse } from '../models/game.model';

/**
 * GameService — provides all HTTP methods for the Games feature.
 *
 * Security: HttpParams.set() is used exclusively for query construction.
 * Angular HttpParams URL-encodes all values automatically, preventing
 * parameter injection attacks (T-3-02).
 */
@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly apiUrl = `${environment.apiUrl}/games`;

  constructor(private readonly http: HttpClient) {}

  private resolveImageUrl(url: string): string {
    if (!url || url.startsWith('http')) return url;
    return `${environment.apiUrl}/${url}`;
  }

  private normalizeGame(game: Game): Game {
    return { ...game, imageUrl: this.resolveImageUrl(game.imageUrl) };
  }

  /**
   * Fetch a paginated, filterable list of games.
   * Only defined, non-null, non-empty values are appended as query params.
   */
  getGames(query: GameQueryParameters = {}): Observable<PagedGameResponse> {
    let params = new HttpParams();

    if (query.pageNumber != null) {
      params = params.set('pageNumber', String(query.pageNumber));
    }
    if (query.pageSize != null) {
      params = params.set('pageSize', String(query.pageSize));
    }
    if (query.genre != null && query.genre !== '') {
      params = params.set('genre', query.genre);
    }
    if (query.minPrice != null) {
      params = params.set('minPrice', String(query.minPrice));
    }
    if (query.maxPrice != null) {
      params = params.set('maxPrice', String(query.maxPrice));
    }
    if (query.sortBy != null && query.sortBy !== '') {
      params = params.set('sortBy', query.sortBy);
    }
    if (query.sortOrder != null && query.sortOrder !== '') {
      params = params.set('sortOrder', query.sortOrder);
    }
    if (query.searchTerm != null && query.searchTerm !== '') {
      params = params.set('searchTerm', query.searchTerm);
    }

    return this.http.get<PagedGameResponse>(this.apiUrl, { params }).pipe(
      map(res => ({ ...res, games: res.games.map(g => this.normalizeGame(g)) }))
    );
  }

  /**
   * Fetch a single game by ID.
   */
  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`).pipe(
      map(g => this.normalizeGame(g))
    );
  }

  /**
   * Fetch the 5 most recently released games for the hero carousel.
   * Delegates to getGames() with fixed sort params (D-01).
   */
  getFeaturedGames(): Observable<PagedGameResponse> {
    return this.getGames({
      sortBy: 'releaseDate',
      sortOrder: 'desc',
      pageSize: 5,
      pageNumber: 1,
    });
  }
}
