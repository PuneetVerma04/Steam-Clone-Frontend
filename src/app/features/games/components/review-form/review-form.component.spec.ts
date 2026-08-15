import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewFormComponent } from './review-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReviewService } from '@features/reviews/services/review.service';
import { NotificationService } from '@core/services/notification.service';

describe('ReviewFormComponent', () => {
  let component: ReviewFormComponent;
  let fixture: ComponentFixture<ReviewFormComponent>;
  const mockReviewService = { createReview: vi.fn() };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewFormComponent, StarRatingComponent],
      imports: [
        CommonModule, ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatButtonModule, MatIconModule, NoopAnimationsModule,
      ],
      providers: [
        { provide: ReviewService, useValue: mockReviewService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ReviewFormComponent);
    component = fixture.componentInstance;
    component.gameId = 3;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when rating is 0', () => {
    component.reviewForm.patchValue({ rating: 0 });
    expect(component.reviewForm.invalid).toBe(true);
  });

  it('form is valid when rating is 1–5', () => {
    component.reviewForm.patchValue({ rating: 4 });
    expect(component.reviewForm.valid).toBe(true);
  });
});
