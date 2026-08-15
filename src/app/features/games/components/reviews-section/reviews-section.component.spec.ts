import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewsSectionComponent } from './reviews-section.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewService } from '@features/reviews/services/review.service';
import { OrderService } from '@features/orders/services/order.service';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { NotificationService } from '@core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ReviewsSectionComponent', () => {
  let component: ReviewsSectionComponent;
  let fixture: ComponentFixture<ReviewsSectionComponent>;

  const mockReviewService = { getReviews: vi.fn().mockReturnValue(of([])) };
  const mockOrderService = { getOrders: vi.fn().mockReturnValue(of([])) };
  const mockAuthService = { currentUser$: new BehaviorSubject(null) };
  const mockTokenService = { getUserId: vi.fn().mockReturnValue(null) };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };
  const mockDialog = { open: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewsSectionComponent],
      imports: [CommonModule, MatIconModule, RouterModule.forRoot([])],
      providers: [
        { provide: ReviewService, useValue: mockReviewService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialog, useValue: mockDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(ReviewsSectionComponent);
    component = fixture.componentInstance;
    component.gameId = 3;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('averageRating returns 0 when reviews array is empty', () => {
    component.reviews = [];
    expect(component.averageRating).toBe(0);
  });

  it('averageRating computes to 1 decimal place', () => {
    component.reviews = [
      { reviewId: 1, userId: 1, gameId: 3, rating: 4, reviewDate: new Date() },
      { reviewId: 2, userId: 2, gameId: 3, rating: 3, reviewDate: new Date() },
    ] as any;
    expect(component.averageRating).toBe(3.5);
  });
});
