import { ChangeDetectorRef, Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { NotificationService } from '@core/services/notification.service';

@Component({
  standalone: false,
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
})
export class OrderHistoryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  orders: Order[] = [];
  loading = true;
  hasError = false;

  constructor(
    private readonly orderService: OrderService,
    private readonly router: Router,
    private readonly notification: NotificationService,
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          this.ngZone.run(() => {
            this.orders = orders;
            this.loading = false;
            this.cd.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.hasError = true;
            this.loading = false;
            this.cd.detectChanges();
          });
          this.notification.error("Couldn't load your orders. Please try again.");
        },
      });
  }

  navigateToDetail(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }
}
