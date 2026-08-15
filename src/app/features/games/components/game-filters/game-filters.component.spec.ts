import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { vi } from 'vitest';
import { GameFiltersComponent } from './game-filters.component';

describe('GameFiltersComponent', () => {
  let component: GameFiltersComponent;
  let fixture: ComponentFixture<GameFiltersComponent>;
  let emitted: unknown[];

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      declarations: [GameFiltersComponent],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameFiltersComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.filterChange.subscribe((val: unknown) => emitted.push(val));
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Test 1: search control emits filterChange only after 300ms debounce', () => {
    component.filtersForm.get('q')!.setValue('hal');
    vi.advanceTimersByTime(100);
    expect(emitted.length).toBe(0);

    vi.advanceTimersByTime(200); // total 300ms
    expect(emitted.length).toBe(1);
  });

  it('Test 2: genre control change immediately emits filterChange (no debounce)', () => {
    component.filtersForm.get('genre')!.setValue('Action');
    vi.advanceTimersByTime(0);
    expect(emitted.length).toBe(1);
  });

  it('Test 3: clearFilters() resets all controls to empty/null state and emits filterChange', () => {
    // Set some values first
    component.filtersForm.get('q')!.setValue('test');
    vi.advanceTimersByTime(300);
    component.filtersForm.get('genre')!.setValue('RPG');
    vi.advanceTimersByTime(0);
    emitted = []; // clear emissions from setup

    component.clearFilters();
    vi.advanceTimersByTime(300); // wait for debounce on q reset

    const form = component.filtersForm.value;
    expect(form.q).toBe('');
    expect(form.genre).toBe('');
    expect(form.minPrice).toBeNull();
    expect(form.maxPrice).toBeNull();
    expect(form.sort).toBe('');
    // At least one emit from clearFilters (genre/sort/price reset triggers immediate emit)
    expect(emitted.length).toBeGreaterThanOrEqual(1);
  });

  it('Test 4: filterChange emits an object with keys q, genre, minPrice, maxPrice, sort', () => {
    component.filtersForm.get('genre')!.setValue('Action');
    vi.advanceTimersByTime(0);
    expect(emitted.length).toBe(1);
    const payload = emitted[0] as Record<string, unknown>;
    expect(payload).toHaveProperty('q');
    expect(payload).toHaveProperty('genre');
    expect(payload).toHaveProperty('minPrice');
    expect(payload).toHaveProperty('maxPrice');
    expect(payload).toHaveProperty('sort');
  });
});
