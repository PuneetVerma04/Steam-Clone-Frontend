import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewEditDialogComponent } from './review-edit-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ReviewEditDialogComponent', () => {
  let component: ReviewEditDialogComponent;
  let fixture: ComponentFixture<ReviewEditDialogComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewEditDialogComponent, StarRatingComponent],
      imports: [
        CommonModule, ReactiveFormsModule, MatDialogModule,
        MatFormFieldModule, MatInputModule, MatIconModule, NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { reviewId: 1, rating: 4, comment: 'Good' } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ReviewEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is pre-populated with dialog data', () => {
    expect(component.editForm.get('rating')?.value).toBe(4);
    expect(component.editForm.get('comment')?.value).toBe('Good');
  });

  it('cancel() closes dialog with undefined', () => {
    component.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
