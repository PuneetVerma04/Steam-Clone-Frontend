import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Review } from '@features/reviews/models/review.model';

@Component({
  standalone: false,
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
})
export class ReviewCardComponent {
  @Input() review!: Review;
  @Input() currentUserId: number | null = null;

  @Output() editClicked = new EventEmitter<Review>();
  @Output() deleteClicked = new EventEmitter<Review>();

  get isOwnReview(): boolean {
    return this.currentUserId !== null && this.review.userId === this.currentUserId;
  }

  onEdit(): void {
    this.editClicked.emit(this.review);
  }

  onDelete(): void {
    this.deleteClicked.emit(this.review);
  }
}
