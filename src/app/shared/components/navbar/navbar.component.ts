import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { AuthResponse } from '@core/models/auth.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  currentUser$: Observable<AuthResponse | null>;

  /** Live cart item count from CartService — drives mat-badge on cart icon */
  cartCount$: Observable<number>;

  // Mobile hamburger state
  isMobileMenuOpen = false;

  constructor(private authService: AuthService, private cartService: CartService) {
    this.currentUser$ = this.authService.currentUser$;
    this.cartCount$ = this.cartService.cartItems$.pipe(map(items => items.reduce((sum, item) => sum + item.quantity, 0)));
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
