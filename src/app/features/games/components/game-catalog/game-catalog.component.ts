import { ChangeDetectorRef, Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, timeout } from 'rxjs/operators';
import { PagedGameResponse } from '../../models/game.model';
import { PageEvent } from '@angular/material/paginator';
import { GameService } from '../../services/game.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { Game, GameQueryParameters } from '../../models/game.model';

@Component({
  standalone: false,
  selector: 'app-game-catalog',
  templateUrl: './game-catalog.component.html',
  styleUrls: ['./game-catalog.component.scss'],
})
export class GameCatalogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  games: Game[] = [];
  featuredGames: Game[] = [];
  totalCount = 0;
  readonly pageSize = 12;
  pageIndex = 0;
  loading = true;
  showCarousel = false;
  currentQuery: GameQueryParameters = {};

  constructor(
    private readonly gameService: GameService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Featured games load once — independent of catalog, never blocks game display
    this.gameService.getFeaturedGames().pipe(
      timeout(5000),
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(featured => {
      if (featured) {
        this.featuredGames = featured.games;
        this.showCarousel = featured.games.length > 0;
      }
    });

    // Catalog reloads on every filter/page change; switchMap cancels in-flight requests.
    // distinctUntilChanged prevents duplicate HTTP calls when params object reference
    // changes but the serialized values are identical (e.g. mat-select init microtask).
    this.route.queryParams
      .pipe(
        map(p => JSON.stringify(p)),
        distinctUntilChanged(),
        map(s => JSON.parse(s) as Record<string, string>),
        switchMap(params => {
          this.currentQuery = this.paramsToQuery(params);
          this.pageIndex = Math.max((this.currentQuery.pageNumber ?? 1) - 1, 0);
          this.loading = true;
          return this.gameService.getGames(this.currentQuery).pipe(
            timeout(8000),
            catchError(() => of({
              games: [], totalCount: 0, pageNumber: 1, pageSize: 12,
              totalPages: 0, hasPrevious: false, hasNext: false,
            } as PagedGameResponse)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (catalog) => {
          // NgZone.run() ensures Angular's change detection fires even if the HTTP
          // callback arrives outside the zone (e.g. when Zone.js fetch patch is absent).
          this.ngZone.run(() => {
            this.games = catalog.games;
            this.totalCount = catalog.totalCount;
            this.loading = false;
            this.cd.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.loading = false;
            this.cd.detectChanges();
          });
        },
      });
  }

  private paramsToQuery(params: Record<string, string>): GameQueryParameters {
    const sort = this.sortToParams(params['sort']);
    return {
      pageNumber: params['page'] ? +params['page'] : 1,
      pageSize: this.pageSize,
      genre: params['genre'] || undefined,
      minPrice: params['minPrice'] ? +params['minPrice'] : undefined,
      maxPrice: params['maxPrice'] ? +params['maxPrice'] : undefined,
      sortBy: sort?.sortBy,
      sortOrder: sort?.sortOrder,
      searchTerm: params['q'] || undefined,
    };
  }

  private sortToParams(sort: string): { sortBy: string; sortOrder: string } | undefined {
    switch (sort) {
      case 'newest':     return { sortBy: 'releaseDate', sortOrder: 'desc' };
      case 'price-asc':  return { sortBy: 'price', sortOrder: 'asc' };
      case 'price-desc': return { sortBy: 'price', sortOrder: 'desc' };
      case 'title-asc':  return { sortBy: 'title', sortOrder: 'asc' };
      default:           return undefined;
    }
  }

  onFilterChange(partial: Record<string, unknown>): void {
    const params: Record<string, unknown> = { page: 1 };
    for (const [k, v] of Object.entries(partial)) {
      if (v !== '' && v !== null && v !== undefined) {
        params[k] = v;
      }
    }
    this.router.navigate(['/games'], { queryParams: params });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: event.pageIndex + 1 },
      queryParamsHandling: 'merge',
    });
  }

  addToCart(game: Game): void {
    if (!this.authService.currentUser$.getValue()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/games' },
      });
      return;
    }
    this.cartService.addItem(game).subscribe();
  }
}
