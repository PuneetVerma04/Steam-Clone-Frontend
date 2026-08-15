import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { register } from 'swiper/element/bundle';

// Register Swiper Web Components before Angular bootstraps.
// CUSTOM_ELEMENTS_SCHEMA must be added to any NgModule template that uses <swiper-container>.
register();

// GSAP usage: import { gsap } from 'gsap'; in any component or service
// No global registration needed for GSAP 3.

platformBrowser().bootstrapModule(AppModule)
  .catch((err: unknown) => console.error(err));
