import { Component, Input } from '@angular/core';
import { Game } from '../../models/game.model';

@Component({
  standalone: false,
  selector: 'app-catalog-hero',
  templateUrl: './catalog-hero.component.html',
  styleUrls: ['./catalog-hero.component.scss'],
})
export class CatalogHeroComponent {
  @Input() games: Game[] = [];
}
