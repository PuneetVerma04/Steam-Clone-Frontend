import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';
import { provideNgProgressOptions } from 'ngx-progressbar';
import { provideNgProgressRouter } from 'ngx-progressbar/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,       // Required for Angular Material animations and ngx-toastr
    AppRoutingModule,
    CoreModule,                    // Imported ONCE here — contains singleton services + interceptors
    SharedModule,                  // Shared UI declarations available in AppComponent template
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      timeOut: 4000,
    }),
    NgProgressbar,                 // Standalone component — imported directly
    NgProgressRouter,              // Hooks into Router navigation events automatically
  ],
  providers: [
    provideNgProgressOptions({ speed: 200 }),
    provideNgProgressRouter({}),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
