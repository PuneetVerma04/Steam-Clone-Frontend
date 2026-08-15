import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewCardComponent } from './review-card.component';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Review } from '@features/reviews/models/review.model';

const MOCK_REVIEW: Review = {
  reviewId: 1, userId: 42, username: 'player1', gameId: 3,
  comment: 'Great game', rating: 4, reviewDate: new Date('2026-01-15'),
};

describe('ReviewCardComponent', () => {
  let component: ReviewCardComponent;
  let fixture: ComponentFixture<ReviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewCardComponent, StarRatingComponent],
      imports: [CommonModule, MatIconModule, MatButtonModule],
      providers: [DatePipe],
    }).compileComponents();
    fixture = TestBed.createComponent(ReviewCardComponent);
    component = fixture.componentInstance;
    component.review = MOCK_REVIEW;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isOwnReview is true when currentUserId matches review.userId', () => {
    component.currentUserId = 42;
    expect(component.isOwnReview).toBe(true);
  });

  it('isOwnReview is false when currentUserId differs', () => {
    component.currentUserId = 99;
    expect(component.isOwnReview).toBe(false);
  });
});
