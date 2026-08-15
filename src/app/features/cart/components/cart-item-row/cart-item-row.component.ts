import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '@features/cart/models/cart.model';

@Component({
  standalone: false,
  selector: 'app-cart-item-row',
  templateUrl: './cart-item-row.component.html',
  styleUrls: ['./cart-item-row.component.scss'],
})
export class CartItemRowComponent {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<{ gameId: number; quantity: number }>();
  @Output() remove = new EventEmitter<number>();

  onDecrement(): void {
    // D-08: at qty=1, – fires remove immediately (no confirmation)
    if (this.item.quantity <= 1) {
      this.remove.emit(this.item.gameId);
    } else {
      this.quantityChange.emit({ gameId: this.item.gameId, quantity: this.item.quantity - 1 });
    }
  }

  onIncrement(): void {
    this.quantityChange.emit({ gameId: this.item.gameId, quantity: this.item.quantity + 1 });
  }

  onRemove(): void {
    this.remove.emit(this.item.gameId);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-game.png';
  }
}
