import { ChangeDetectorRef, Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, timeout } from 'rxjs/operators';
import { GameService } from '../../services/game.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { Game } from '../../models/game.model';

@Component({
  standalone: false,
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent implements OnInit {
  /** DestroyRef as class field — required by takeUntilDestroyed() pattern */
  private readonly destroyRef = inject(DestroyRef);

  game: Game | null = null;
  loading = false;

  /** Local flag for showing spinner during addItem() HTTP call */
  addingToCart = false;

  constructor(
    private readonly gameService: GameService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = Number(params.get('id'));
          return this.gameService.getGameById(id).pipe(timeout(8000));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: game => {
          this.ngZone.run(() => {
            this.game = game;
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

  /**
   * Add current game to cart.
   * Unauthenticated users are redirected to /auth/login?returnUrl=<current URL>.
   * Uses optimistic update via CartService.addItem().
   */
  addToCart(): void {
    if (!this.authService.currentUser$.getValue()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    if (this.game) {
      this.addingToCart = true;
      this.cartService.addItem(this.game).subscribe({
        next: () => { this.addingToCart = false; },
        error: () => { this.addingToCart = false; },
      });
    }
  }

  /**
   * Returns true if this game is already in the cart.
   * Synchronous check via BehaviorSubject.getValue().
   */
  isInCart(): boolean {
    return this.cartService.cartItems$.getValue().some(item => item.gameId === this.game?.id);
  }

  /**
   * Image error fallback — sets src to placeholder image.
   * Security: sets string literal path, not user input (T-3-03 safe).
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-game.png';
  }
}
