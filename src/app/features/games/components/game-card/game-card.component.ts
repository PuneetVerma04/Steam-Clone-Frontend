import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Game } from '../../models/game.model';

@Component({
  standalone: false,
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
  @Input() game!: Game;
  @Output() addToCart = new EventEmitter<Game>();

  onAddToCart(): void {
    this.addToCart.emit(this.game);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-game.png';
  }
}
