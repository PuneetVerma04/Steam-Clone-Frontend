import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { CartItem } from '@features/cart/models/cart.model';

@Component({
  standalone: false,
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly cartItems$ = this.cartService.cartItems$;
  loading = true;

  ngOnInit(): void {
    // APP_INITIALIZER already populated cartItems$ before first render,
    // but calling getCart() on component init handles page refreshes and sets loading=false.
    this.cartService.getCart().subscribe({
      next: () => { this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  getRunningTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  onQuantityChange(event: { gameId: number; quantity: number }): void {
    if (event.quantity <= 0) {
      this.cartService.removeItem(event.gameId).subscribe();
    } else {
      this.cartService.updateQuantity(event.gameId, event.quantity).subscribe();
    }
  }

  onRemoveItem(gameId: number): void {
    this.cartService.removeItem(gameId).subscribe();
  }

  onProceedToCheckout(): void {
    this.router.navigate(['/cart/checkout']);
  }
}
