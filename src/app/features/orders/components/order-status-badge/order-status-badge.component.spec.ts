import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderStatusBadgeComponent } from './order-status-badge.component';
import { OrderStatus } from '../../models/order.model';

describe('OrderStatusBadgeComponent', () => {
  let component: OrderStatusBadgeComponent;
  let fixture: ComponentFixture<OrderStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderStatusBadgeComponent);
    component = fixture.componentInstance;
    component.status = OrderStatus.Completed;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render status badge with correct class', () => {
    const span = fixture.nativeElement.querySelector('.status-badge');
    expect(span).toBeTruthy();
    expect(span.classList).toContain('status-badge--completed');
  });
});
