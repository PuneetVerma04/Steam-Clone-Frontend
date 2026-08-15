import { Component, Input } from '@angular/core';
import { OrderStatus } from '../../models/order.model';

@Component({
  standalone: false,
  selector: 'app-order-status-badge',
  templateUrl: './order-status-badge.component.html',
  styleUrls: ['./order-status-badge.component.scss'],
})
export class OrderStatusBadgeComponent {
  @Input() status!: OrderStatus;
}
