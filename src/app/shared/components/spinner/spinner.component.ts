import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Input() diameter = 48;
  @Input() strokeWidth = 4;
}
