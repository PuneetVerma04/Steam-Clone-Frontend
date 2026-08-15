import {
  ChangeDetectorRef, Component, DestroyRef,
  inject, Input, NgZone, OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ReviewService } from '@features/reviews/services/review.service';
import { OrderService } from '@features/orders/services/order.service';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { NotificationService } from '@core/services/notification.service';
import { Review, ReviewUpdateDto } from '@features/reviews/models/review.model';
import { ReviewEditDialogComponent, ReviewEditDialogData } from '../review-edit-dialog/review-edit-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  standalone: false,
  selector: 'app-reviews-section',
  templateUrl: './reviews-section.component.html',
  styleUrls: ['./reviews-section.component.scss'],
})
export class ReviewsSectionComponent implements OnInit {
  @Input() gameId!: number;

  private readonly destroyRef = inject(DestroyRef);

  reviews: Review[] = [];
  loading = true;
  hasPurchased = false;
  orderCheckPending = false;
  currentUserId: number | null = null;
  isAuthenticated = false;

  constructor(
    private readonly reviewService: ReviewService,
    private readonly orderService: OrderService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly notificationService: NotificationService,
    private readonly dialog: MatDialog,
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = !!this.authService.currentUser$.getValue();
    this.currentUserId = this.tokenService.getUserId();

    this.reviewService.getReviews(this.gameId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reviews => {
          this.ngZone.run(() => {
            this.reviews = reviews;
            this.loading = false;
            this.cd.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.loading = false;
            this.cd.detectChanges();
          });
        },
      });

    if (this.isAuthenticated) {
      this.checkPurchaseEligibility();
    }
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  onReviewCreated(newReview: Review): void {
    this.ngZone.run(() => {
      this.reviews = [newReview, ...this.reviews];
      this.cd.detectChanges();
    });
  }

  openEditDialog(review: Review): void {
    const data: ReviewEditDialogData = {
      reviewId: review.reviewId,
      rating: review.rating,
      comment: review.comment ?? '',
    };
    const dialogRef = this.dialog.open(ReviewEditDialogComponent, {
      data,
      width: '480px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: ReviewUpdateDto | undefined) => {
        if (result) {
          this.reviewService.updateReview(review.reviewId, result)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: updated => {
                this.ngZone.run(() => {
                  const idx = this.reviews.findIndex(r => r.reviewId === review.reviewId);
                  if (idx !== -1) this.reviews = [
                    ...this.reviews.slice(0, idx),
                    updated,
                    ...this.reviews.slice(idx + 1),
                  ];
                  this.notificationService.success('Review updated.');
                  this.cd.detectChanges();
                });
              },
              error: () => {
                this.ngZone.run(() => {
                  this.notificationService.error('Failed to update review.');
                  this.cd.detectChanges();
                });
              },
            });
        }
      });
  }

  openDeleteDialog(review: Review): void {
    const data: ConfirmationDialogData = {
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This cannot be undone.',
      confirmLabel: 'Delete Review',
      confirmDanger: true,
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.reviewService.deleteReview(review.reviewId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.ngZone.run(() => {
                  this.reviews = this.reviews.filter(r => r.reviewId !== review.reviewId);
                  this.notificationService.success('Review deleted.');
                  this.cd.detectChanges();
                });
              },
              error: () => {
                this.ngZone.run(() => {
                  this.notificationService.error('Failed to delete review.');
                  this.cd.detectChanges();
                });
              },
            });
        }
      });
  }

  private checkPurchaseEligibility(): void {
    this.orderCheckPending = true;
    this.orderService.getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: orders => {
          this.ngZone.run(() => {
            this.hasPurchased = orders.some(order =>
              order.items.some(item => item.gameId === this.gameId)
            );
            this.orderCheckPending = false;
            this.cd.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.hasPurchased = false;
            this.orderCheckPending = false;
            this.cd.detectChanges();
          });
        },
      });
  }
}
