import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReviewUpdateDto } from '@features/reviews/models/review.model';

export interface ReviewEditDialogData {
  reviewId: number;
  rating: number;
  comment: string;
}

@Component({
  standalone: false,
  selector: 'app-review-edit-dialog',
  templateUrl: './review-edit-dialog.component.html',
  styleUrls: ['./review-edit-dialog.component.scss'],
})
export class ReviewEditDialogComponent {
  editForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ReviewEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewEditDialogData,
  ) {
    this.editForm = this.fb.group({
      rating: [this.data.rating, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [this.data.comment ?? ''],
    });
  }

  onRatingChange(rating: number): void {
    this.editForm.patchValue({ rating });
  }

  save(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.editForm.value as ReviewUpdateDto);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
