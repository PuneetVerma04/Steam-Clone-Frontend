import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'aphelion-frontend';

  constructor() {
    register();
  }
}
