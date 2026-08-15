import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() borderRadius = '4px';
}
