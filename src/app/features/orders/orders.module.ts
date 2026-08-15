import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderStatusBadgeComponent } from './components/order-status-badge/order-status-badge.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';

@NgModule({
  declarations: [
    OrderStatusBadgeComponent,
    OrderHistoryComponent,
    OrderDetailComponent,
    OrderConfirmationComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    OrdersRoutingModule,
  ],
})
export class OrdersModule {}
