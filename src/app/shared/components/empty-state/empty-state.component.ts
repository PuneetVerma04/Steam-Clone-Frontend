import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  @Input() message = 'Nothing here yet.';
  @Input() ctaLabel = '';
  @Input() ctaLink = '';
}
