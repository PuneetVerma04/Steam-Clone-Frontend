import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './components/cart/cart.component';
import { CartItemRowComponent } from './components/cart-item-row/cart-item-row.component';
import { CheckoutComponent } from './components/checkout/checkout.component';

@NgModule({
  declarations: [
    CartComponent,
    CartItemRowComponent,
    CheckoutComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CartRoutingModule,
  ],
})
export class CartModule {}
