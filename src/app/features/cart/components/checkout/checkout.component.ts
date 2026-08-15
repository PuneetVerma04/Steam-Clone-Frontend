import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { OrderService } from '@features/orders/services/order.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  standalone: false,
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly cartItems$ = this.cartService.cartItems$;
  isSubmitting = false;

  get runningTotal(): number {
    return this.cartService.cartItems$.getValue()
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  placeOrder(): void {
    if (this.isSubmitting) { return; }
    this.isSubmitting = true;
    this.orderService.checkout().subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.isSubmitting = false;
        this.router.navigate(['/orders', order.orderId, 'confirmation']);
      },
      error: () => {
        this.notification.error("Couldn't place your order. Please try again.");
        this.isSubmitting = false;
      },
    });
  }
}
