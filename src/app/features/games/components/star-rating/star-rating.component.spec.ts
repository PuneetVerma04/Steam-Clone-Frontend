import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRatingComponent } from './star-rating.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
  let fixture: ComponentFixture<StarRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StarRatingComponent],
      imports: [CommonModule, MatIconModule],
    }).compileComponents();
    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getStarIcon returns "star" when rating >= star index', () => {
    component.rating = 4;
    expect(component.getStarIcon(4)).toBe('star');
    expect(component.getStarIcon(5)).toBe('star_border');
  });

  it('getStarIcon returns "star_half" when rating >= star - 0.5', () => {
    component.rating = 3.5;
    expect(component.getStarIcon(4)).toBe('star_half');
  });

  it('does not emit ratingChange when interactive is false', () => {
    const spy = vi.spyOn(component.ratingChange, 'emit');
    component.interactive = false;
    component.onStarClick(3);
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits ratingChange with star value when interactive is true', () => {
    const spy = vi.spyOn(component.ratingChange, 'emit');
    component.interactive = true;
    component.onStarClick(3);
    expect(spy).toHaveBeenCalledWith(3);
  });
});
