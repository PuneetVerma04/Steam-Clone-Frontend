import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewService } from '@features/reviews/services/review.service';
import { NotificationService } from '@core/services/notification.service';
import { Review, ReviewCreateDto } from '@features/reviews/models/review.model';

@Component({
  standalone: false,
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
})
export class ReviewFormComponent {
  @Input() gameId!: number;
  @Output() reviewCreated = new EventEmitter<Review>();

  private readonly destroyRef = inject(DestroyRef);
  submitting = false;
  reviewForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly reviewService: ReviewService,
    private readonly notificationService: NotificationService,
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    });
  }

  onRatingChange(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  submit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const dto: ReviewCreateDto = this.reviewForm.value as ReviewCreateDto;
    this.reviewService.createReview(this.gameId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: newReview => {
          this.submitting = false;
          this.reviewForm.reset({ rating: 0, comment: '' });
          this.reviewCreated.emit(newReview);
          this.notificationService.success('Review submitted.');
        },
        error: () => {
          this.submitting = false;
          this.notificationService.error('Failed to submit review.');
        },
      });
  }
}
