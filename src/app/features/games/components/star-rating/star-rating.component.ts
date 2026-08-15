import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent {
  @Input() rating: number = 0;           // 0.0–5.0, supports decimals for display
  @Input() interactive: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number = 0;               // tracks mouse position in interactive mode
  stars = [1, 2, 3, 4, 5];

  getStarIcon(star: number): string {
    const effective = this.interactive && this.hoverRating > 0
      ? this.hoverRating
      : this.rating;
    if (effective >= star) return 'star';
    if (effective >= star - 0.5) return 'star_half';
    return 'star_border';
  }

  isHovered(star: number): boolean {
    return this.interactive && this.hoverRating > 0 && star <= this.hoverRating;
  }

  onStarClick(star: number): void {
    if (this.interactive) {
      this.ratingChange.emit(star);
    }
  }

  onStarHover(star: number): void {
    if (this.interactive) this.hoverRating = star;
  }

  onMouseLeave(): void {
    this.hoverRating = 0;
  }
}
