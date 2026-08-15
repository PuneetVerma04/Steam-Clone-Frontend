import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Game } from '@features/games/models/game.model';
import { CartItem, CartRequest } from '@features/cart/models/cart.model';
import { NotificationService } from '@core/services/notification.service';

/**
 * CartService — singleton cart state with optimistic UI updates.
 *
 * Lives in core/ because it is shared across multiple features
 * (GameCardComponent, GameDetailComponent, NavbarComponent).
 *
 * Phase 3 scope: addItem() only.
 * Phase 4 extends with removeItem(), updateQuantity(), getCart().
 *
 * Optimistic update pattern (T-3-01 mitigation):
 *   1. Snapshot current state
 *   2. Push optimistic item immediately (UI responds instantly)
 *   3. POST to backend; on success tap() reconciles with authoritative server state
 *   4. On error: restore snapshot + show error toast
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  readonly cartItems$ = new BehaviorSubject<CartItem[]>([]);

  constructor(
    private readonly http: HttpClient,
    private readonly notification: NotificationService
  ) {}

  /**
   * Add a game to the cart.
   *
   * Optimistically updates cartItems$ before the HTTP call so the UI
   * responds immediately. The server response (CartItem[]) is authoritative
   * and reconciles the state via tap(). On HTTP error the snapshot is restored
   * and an error toast is shown.
   *
   * @param game The Game to add (quantity always 1 per D-04)
   * @returns Observable<CartItem[]> — emits the server-reconciled cart on success
   */
  addItem(game: Game): Observable<CartItem[]> {
    // Take spread copy to avoid reference sharing with the current value
    const snapshot = [...this.cartItems$.getValue()];

    // Optimistically increment if already in cart, otherwise append
    const existing = snapshot.find(item => item.gameId === game.id);
    const optimistic = existing
      ? snapshot.map(item => item.gameId === game.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...snapshot, { gameId: game.id, title: game.title, quantity: 1, price: game.price, imageUrl: game.imageUrl }];

    this.cartItems$.next(optimistic);

    // POST body: only gameId + quantity (CartRequest shape, never extra fields)
    const body: CartRequest = { gameId: game.id, quantity: 1 };

    return this.http.post<CartItem[]>(`${this.apiUrl}/add`, body).pipe(
      // Server response is authoritative — reconcile state
      tap(serverCart => this.cartItems$.next(serverCart)),
      catchError(error => {
        // Restore pre-call snapshot on any HTTP failure
        this.cartItems$.next(snapshot);
        this.notification.error("Couldn't add to cart. Please try again.");
        return throwError(() => error);
      })
    );
  }

  /**
   * Fetch the current cart from the server and update cartItems$.
   * Called by APP_INITIALIZER (via initCart) and optionally on cart page load.
   */
  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl).pipe(
      tap(serverCart => this.cartItems$.next(serverCart)),
      catchError(error => {
        this.notification.error("Couldn't load cart. Please try again.");
        return throwError(() => error);
      })
    );
  }

  /**
   * Optimistically update item quantity before PATCH fires.
   * Server response reconciles authoritative state (T-04-01 mitigation).
   */
  updateQuantity(gameId: number, quantity: number): Observable<CartItem[]> {
    const snapshot = [...this.cartItems$.getValue()];
    const optimistic = snapshot.map(item =>
      item.gameId === gameId ? { ...item, quantity } : item
    );
    this.cartItems$.next(optimistic);
    const body: CartRequest = { gameId, quantity };
    return this.http.patch<CartItem[]>(`${this.apiUrl}/update`, body).pipe(
      tap(serverCart => this.cartItems$.next(serverCart)),
      catchError(error => {
        this.cartItems$.next(snapshot);
        this.notification.error("Couldn't update quantity. Please try again.");
        return throwError(() => error);
      })
    );
  }

  /**
   * Optimistically remove item before PATCH fires.
   * PATCH /cart/update with quantity:0 signals removal to backend.
   */
  removeItem(gameId: number): Observable<CartItem[]> {
    const snapshot = [...this.cartItems$.getValue()];
    this.cartItems$.next(snapshot.filter(item => item.gameId !== gameId));
    const body: CartRequest = { gameId, quantity: 0 };
    return this.http.patch<CartItem[]>(`${this.apiUrl}/update`, body).pipe(
      tap(serverCart => this.cartItems$.next(serverCart)),
      catchError(error => {
        this.cartItems$.next(snapshot);
        this.notification.error("Couldn't remove item. Please try again.");
        return throwError(() => error);
      })
    );
  }

  /**
   * Synchronously clear cart state (no HTTP).
   * Called after successful checkout and on logout (AUTH-04).
   */
  clearCart(): void {
    this.cartItems$.next([]);
  }

  /**
   * Bootstrap initializer — called by APP_INITIALIZER before first render.
   * Must never reject — catchError swallows HTTP errors so bootstrap never freezes (T-04-02 mitigation).
   */
  initCart(): Promise<void> {
    return firstValueFrom(
      this.http.get<CartItem[]>(this.apiUrl).pipe(
        tap(serverCart => this.cartItems$.next(serverCart)),
        catchError(() => of([]))  // MANDATORY — silent failure keeps bootstrap alive
      )
    ).then(() => undefined);
  }
}
