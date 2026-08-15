import { ChangeDetectorRef, Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  standalone: false,
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
})
export class OrderConfirmationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  order: Order | null = null;
  loading = true;
  notFound = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService,
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = Number(params.get('id'));
          return this.orderService.getOrderById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (order) => {
          this.ngZone.run(() => {
            this.order = order;
            this.loading = false;
            this.cd.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.loading = false;
            this.notFound = err?.status === 404 || err?.status === 403;
            this.cd.detectChanges();
          });
        },
      });
  }
}
