import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { OrderService } from './order.service';
import { Order, OrderStatus } from '../models/order.model';

const BASE_URL = 'http://localhost:5062/store/order';

const MOCK_ORDER: Order = {
  orderId: 1,
  userId: 42,
  items: [],
  totalPrice: 0,
  orderDate: new Date('2026-04-24'),
  status: OrderStatus.Pending,
};

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), OrderService],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(OrderService);
  });

  afterEach(() => { httpMock.verify(); });

  it('getOrders() sends GET /order', () => {
    service.getOrders().subscribe();
    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_ORDER]);
  });

  it('getOrderById(5) sends GET /order/5', () => {
    service.getOrderById(5).subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_ORDER);
  });

  it('checkout() sends POST /order/checkout with empty body', () => {
    service.checkout().subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/checkout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(MOCK_ORDER);
  });
});
