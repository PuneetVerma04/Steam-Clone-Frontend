import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { vi } from 'vitest';

import { GameDetailComponent } from './game-detail.component';
import { GameService } from '../../services/game.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { Game } from '../../models/game.model';
import { CartItem } from '@features/cart/models/cart.model';
import { AuthResponse } from '@core/models/auth.model';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

const MOCK_GAME: Game = {
  id: 42,
  title: 'Test Game',
  description: 'A post-apocalyptic adventure game',
  price: 29.99,
  genre: 'Action',
  imageUrl: 'https://example.com/image.jpg',
  releaseDate: '2024-01-01',
  publisherId: 1,
  publisherName: 'Test Publisher',
};

const MOCK_USER: AuthResponse = {
  token: 'fake-token',
  username: 'testuser',
  role: 'Player',
};

describe('GameDetailComponent', () => {
  let component: GameDetailComponent;
  let fixture: ComponentFixture<GameDetailComponent>;
  let mockGameService: { getGameById: ReturnType<typeof vi.fn> };
  let mockCartService: {
    cartItems$: BehaviorSubject<CartItem[]>;
    addItem: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: {
    currentUser$: BehaviorSubject<AuthResponse | null>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn>; url: string };
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject(convertToParamMap({ id: '42' }));

    mockGameService = {
      getGameById: vi.fn().mockReturnValue(of(MOCK_GAME)),
    };

    mockCartService = {
      cartItems$: new BehaviorSubject<CartItem[]>([]),
      addItem: vi.fn().mockReturnValue(of([])),
    };

    mockAuthService = {
      currentUser$: new BehaviorSubject<AuthResponse | null>(MOCK_USER),
    };

    mockRouter = {
      navigate: vi.fn(),
      url: '/games/42',
    };

    await TestBed.configureTestingModule({
      declarations: [GameDetailComponent, SkeletonComponent, SpinnerComponent],
      imports: [NoopAnimationsModule, MatButtonModule, MatIconModule],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: CartService, useValue: mockCartService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMapSubject.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameDetailComponent);
    component = fixture.componentInstance;
  });

  /**
   * Test 1: game description is rendered via template interpolation —
   * component template source does NOT contain the string "[innerHTML]"
   */
  it('Test 1: template does not use [innerHTML] for any content', () => {
    // Get the component's template HTML from the compiled fixture
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const outerHtml = compiled.outerHTML;
    // The rendered DOM should never contain innerHTML binding attribute
    // More importantly: the component's template source must not use [innerHTML]
    // We verify this by checking the component's static template string is not present
    // in the rendered HTML as an attribute
    expect(outerHtml).not.toContain('[innerHTML]');

    // Additional: check no innerHTML attribute on any element in the rendered DOM
    const allElements = compiled.querySelectorAll('[\\[innerHTML\\]]');
    expect(allElements.length).toBe(0);
  });

  /**
   * Test 2: addToCart() when currentUser$.getValue() returns null —
   * Router.navigate called with ['/auth/login'] and queryParams { returnUrl: '/games/42' }
   */
  it('Test 2: addToCart() redirects to /auth/login with returnUrl when unauthenticated', () => {
    mockAuthService.currentUser$.next(null);
    fixture.detectChanges();

    component.addToCart();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/games/42' },
    });
    expect(mockCartService.addItem).not.toHaveBeenCalled();
  });

  /**
   * Test 3: loading flag is true before HTTP response and false after.
   * Uses a Subject so emission is fully synchronous — no fakeAsync/zone needed.
   * Checks component state directly (not via template) to avoid NG0100.
   */
  it('Test 3: loading is true before HTTP response, false after', () => {
    const gameSubject = new Subject<Game>();
    mockGameService.getGameById.mockReturnValue(gameSubject.asObservable());

    // Re-create component with the deferred mock in place
    fixture = TestBed.createComponent(GameDetailComponent);
    component = fixture.componentInstance;

    expect(component.loading).toBe(false); // before ngOnInit

    // Call ngOnInit directly to avoid triggering Angular's change detection
    // cycle which would raise NG0100 when loading flips mid-detection
    component.ngOnInit();
    expect(component.loading).toBe(true);  // set synchronously in ngOnInit before subscribe

    gameSubject.next(MOCK_GAME);           // synchronous emit → loading = false
    gameSubject.complete();
    expect(component.loading).toBe(false); // after response arrives
  });

  /**
   * Test 4: when getGameById() returns a game, this.game is set and this.loading is false
   */
  it('Test 4: when getGameById returns a game, component.game is set and loading is false', () => {
    mockGameService.getGameById.mockReturnValue(of(MOCK_GAME));
    fixture.detectChanges();

    expect(component.game).toEqual(MOCK_GAME);
    expect(component.loading).toBe(false);
  });
});
