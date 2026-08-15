import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameCatalogComponent } from './components/game-catalog/game-catalog.component';
import { GameDetailComponent } from './components/game-detail/game-detail.component';

const routes: Routes = [
  { path: '', component: GameCatalogComponent },
  { path: ':id', component: GameDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamesRoutingModule {}
