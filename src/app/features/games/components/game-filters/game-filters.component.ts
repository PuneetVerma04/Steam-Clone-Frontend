import { Component, DestroyRef, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GENRE_LIST } from '../../constants/game.constants';

@Component({
  standalone: false,
  selector: 'app-game-filters',
  templateUrl: './game-filters.component.html',
  styleUrls: ['./game-filters.component.scss'],
})
export class GameFiltersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Output() filterChange = new EventEmitter<Record<string, unknown>>();

  readonly genres = GENRE_LIST;
  filtersForm!: FormGroup;

  readonly sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low–High', value: 'price-asc' },
    { label: 'Price: High–Low', value: 'price-desc' },
    { label: 'A–Z', value: 'title-asc' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Seed the form from the URL snapshot so bookmarked / back-navigated
    // URLs show the correct filter state on first render.
    const p = this.route.snapshot.queryParams;
    this.filtersForm = this.fb.group({
      q:        [p['q']        || ''],
      genre:    [p['genre']    || ''],
      minPrice: [p['minPrice'] ? +p['minPrice'] : null],
      maxPrice: [p['maxPrice'] ? +p['maxPrice'] : null],
      sort:     [p['sort']     || ''],
    });

    // Search: debounce 300ms before emitting
    this.filtersForm.get('q')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.emitChange());

    // Other filters: emit on every change, passing the live control value
    // directly to avoid FormGroup.value timing quirks with mat-select.
    ['genre', 'minPrice', 'maxPrice', 'sort'].forEach(field => {
      this.filtersForm.get(field)!.valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(newValue => this.emitChange(field, newValue));
    });
  }

  get hasActiveFilters(): boolean {
    const v = this.filtersForm.value;
    return !!(v.q || v.genre || v.minPrice != null || v.maxPrice != null || v.sort);
  }

  clearFilters(): void {
    this.filtersForm.reset({ q: '', genre: '', minPrice: null, maxPrice: null, sort: '' });
  }

  private get isPriceRangeInvalid(): boolean {
    const { minPrice, maxPrice } = this.filtersForm.value;
    return minPrice != null && maxPrice != null && minPrice > maxPrice;
  }

  // changedField + changedValue are passed directly from the valueChanges
  // subscriber so the emitted object always contains the freshly-committed
  // value, even if FormGroup.value hasn't propagated yet.
  private emitChange(changedField?: string, changedValue?: unknown): void {
    if (this.isPriceRangeInvalid) return;
    const snapshot = { ...this.filtersForm.value };
    if (changedField !== undefined) {
      snapshot[changedField] = changedValue;
    }
    this.filterChange.emit(snapshot);
  }
}
