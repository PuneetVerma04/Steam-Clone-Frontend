import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { GamesRoutingModule } from './games-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

import { GameCatalogComponent } from './components/game-catalog/game-catalog.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameFiltersComponent } from './components/game-filters/game-filters.component';
import { CatalogHeroComponent } from './components/catalog-hero/catalog-hero.component';
import { GameDetailComponent } from './components/game-detail/game-detail.component';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { ReviewsSectionComponent } from './components/reviews-section/reviews-section.component';
import { ReviewCardComponent } from './components/review-card/review-card.component';
import { ReviewFormComponent } from './components/review-form/review-form.component';
import { ReviewEditDialogComponent } from './components/review-edit-dialog/review-edit-dialog.component';

@NgModule({
  declarations: [
    GameCatalogComponent,
    GameCardComponent,
    GameFiltersComponent,
    CatalogHeroComponent,
    GameDetailComponent,
    StarRatingComponent,
    ReviewsSectionComponent,
    ReviewCardComponent,
    ReviewFormComponent,
    ReviewEditDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    GamesRoutingModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GamesModule {}
