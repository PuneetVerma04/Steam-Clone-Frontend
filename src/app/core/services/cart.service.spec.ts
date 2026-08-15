import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
// describe/it/expect are Vitest globals — no import needed

import { CartService } from './cart.service';
import { NotificationService } from '@core/services/notification.service';
import { Game } from '@features/games/models/game.model';
import { CartItem } from '@features/cart/models/cart.model';

const MOCK_GAME: Game = {
  id: 7,
  title: 'Wasteland Runner',
  description: 'Post-apocalyptic runner game',
  price: 29.99,
  genre: 'Action',
  imageUrl: 'https://example.com/game.jpg',
  releaseDate: '2024-06-01',
  publisherId: 3,
  publisherName: 'Gray Zone Studios',
};

const MOCK_CART_ITEM: CartItem = {
  gameId: 7,
  title: 'Wasteland Runner',
  quantity: 1,
  price: 29.99,
  imageUrl: 'https://example.com/game.jpg',
};

const SERVER_CART: CartItem[] = [MOCK_CART_ITEM];
const ADD_URL = 'http://localhost:5062/store/cart/add';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let notificationMock: { error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    notificationMock = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CartService,
        { provide: NotificationService, useValue: notificationMock },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ---------------------------------------------------------------------------
  // Test 1: cartItems$ initializes as BehaviorSubject with empty array
  // ---------------------------------------------------------------------------
  it('cartItems$ initializes with empty array []', () => {
    expect(service.cartItems$.getValue()).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Test 2: addItem() synchronously pushes CartItem before HTTP response (optimistic)
  // ---------------------------------------------------------------------------
  it('addItem() synchronously pushes CartItem to cartItems$ before HTTP response', () => {
    service.addItem(MOCK_GAME).subscribe();

    // Before flushing HTTP — optimistic update should already be in place
    const items = service.cartItems$.getValue();
    expect(items.length).toBe(1);
    expect(items[0].gameId).toBe(MOCK_GAME.id);
    expect(items[0].title).toBe(MOCK_GAME.title);
    expect(items[0].quantity).toBe(1);
    expect(items[0].price).toBe(MOCK_GAME.price);
    expect(items[0].imageUrl).toBe(MOCK_GAME.imageUrl);

    // Flush to clean up pending request
    httpMock.expectOne(ADD_URL).flush(SERVER_CART);
  });

  // ---------------------------------------------------------------------------
  // Test 3: addItem() POST body is { gameId: game.id, quantity: 1 }
  // ---------------------------------------------------------------------------
  it('addItem() POST body is { gameId: game.id, quantity: 1 }', () => {
    service.addItem(MOCK_GAME).subscribe();

    const req = httpMock.expectOne(ADD_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ gameId: MOCK_GAME.id, quantity: 1 });
    req.flush(SERVER_CART);
  });

  // ---------------------------------------------------------------------------
  // Test 4: addItem() on HTTP 500 — cartItems$ reverts to pre-call snapshot
  // ---------------------------------------------------------------------------
  it('addItem() on HTTP 500 — cartItems$ reverts to pre-call snapshot', () => {
    const preCallSnapshot: CartItem[] = [];

    service.addItem(MOCK_GAME).subscribe({ error: () => {} });

    // Flush with 500 error
    httpMock.expectOne(ADD_URL).flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(service.cartItems$.getValue()).toEqual(preCallSnapshot);
  });

  // ---------------------------------------------------------------------------
  // Test 5: addItem() on HTTP 500 — NotificationService.error called exactly once
  // ---------------------------------------------------------------------------
  it('addItem() on HTTP 500 — NotificationService.error called with correct message', () => {
    service.addItem(MOCK_GAME).subscribe({ error: () => {} });

    httpMock.expectOne(ADD_URL).flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(notificationMock.error).toHaveBeenCalledTimes(1);
    expect(notificationMock.error).toHaveBeenCalledWith(
      "Couldn't add to cart. Please try again."
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: addItem() on HTTP success — cartItems$ updated to server response
  // ---------------------------------------------------------------------------
  it('addItem() on HTTP success — cartItems$ updated to server response (authoritative reconcile)', () => {
    const serverCart: CartItem[] = [
      { gameId: 7, title: 'Wasteland Runner', quantity: 2, price: 29.99, imageUrl: 'https://example.com/game.jpg' },
    ];

    service.addItem(MOCK_GAME).subscribe();

    httpMock.expectOne(ADD_URL).flush(serverCart);

    expect(service.cartItems$.getValue()).toEqual(serverCart);
  });
});

// ---- Phase 4 extensions ----
describe('CartService (Phase 4 methods)', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let notificationMock: { error: ReturnType<typeof vi.fn> };

  const CART_URL = 'http://localhost:5062/store/cart';
  const UPDATE_URL = 'http://localhost:5062/store/cart/update';

  beforeEach(() => {
    notificationMock = { error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CartService,
        { provide: NotificationService, useValue: notificationMock },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CartService);
  });

  afterEach(() => { httpMock.verify(); });

  it('getCart() sends GET /cart and updates cartItems$', () => {
    service.getCart().subscribe();
    const req = httpMock.expectOne(CART_URL);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_CART_ITEM]);
    expect(service.cartItems$.getValue()).toEqual([MOCK_CART_ITEM]);
  });

  it('getCart() on HTTP 500 calls notification.error', () => {
    service.getCart().subscribe({ error: () => {} });
    httpMock.expectOne(CART_URL).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(notificationMock.error).toHaveBeenCalledWith("Couldn't load cart. Please try again.");
  });

  it('updateQuantity() optimistically updates before HTTP response', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.updateQuantity(MOCK_CART_ITEM.gameId, 3).subscribe();
    expect(service.cartItems$.getValue()[0].quantity).toBe(3);
    httpMock.expectOne(UPDATE_URL).flush([{ ...MOCK_CART_ITEM, quantity: 3 }]);
  });

  it('updateQuantity() sends PATCH /cart/update with { gameId, quantity }', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.updateQuantity(MOCK_CART_ITEM.gameId, 3).subscribe();
    const req = httpMock.expectOne(UPDATE_URL);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ gameId: MOCK_CART_ITEM.gameId, quantity: 3 });
    req.flush([{ ...MOCK_CART_ITEM, quantity: 3 }]);
  });

  it('updateQuantity() on HTTP 500 restores snapshot', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.updateQuantity(MOCK_CART_ITEM.gameId, 3).subscribe({ error: () => {} });
    httpMock.expectOne(UPDATE_URL).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(service.cartItems$.getValue()[0].quantity).toBe(1);
  });

  it('updateQuantity() on HTTP 500 calls notification.error', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.updateQuantity(MOCK_CART_ITEM.gameId, 3).subscribe({ error: () => {} });
    httpMock.expectOne(UPDATE_URL).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(notificationMock.error).toHaveBeenCalledWith("Couldn't update quantity. Please try again.");
  });

  it('removeItem() filters item out of cartItems$ before HTTP response', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.removeItem(MOCK_CART_ITEM.gameId).subscribe();
    expect(service.cartItems$.getValue()).toEqual([]);
    httpMock.expectOne(UPDATE_URL).flush([]);
  });

  it('removeItem() sends PATCH /cart/update with { gameId, quantity: 0 }', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.removeItem(MOCK_CART_ITEM.gameId).subscribe();
    const req = httpMock.expectOne(UPDATE_URL);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ gameId: MOCK_CART_ITEM.gameId, quantity: 0 });
    req.flush([]);
  });

  it('removeItem() on HTTP 500 restores snapshot', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.removeItem(MOCK_CART_ITEM.gameId).subscribe({ error: () => {} });
    httpMock.expectOne(UPDATE_URL).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(service.cartItems$.getValue()).toEqual([MOCK_CART_ITEM]);
  });

  it('clearCart() sets cartItems$ to []', () => {
    service.cartItems$.next([MOCK_CART_ITEM]);
    service.clearCart();
    expect(service.cartItems$.getValue()).toEqual([]);
  });

  it('initCart() returns a Promise', () => {
    const result = service.initCart();
    expect(result).toBeInstanceOf(Promise);
    httpMock.expectOne(CART_URL).flush([MOCK_CART_ITEM]);
  });
});
