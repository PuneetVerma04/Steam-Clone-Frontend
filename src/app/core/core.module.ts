import { APP_INITIALIZER, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { CartService } from '@core/services/cart.service';
import { TokenService } from '@core/services/token.service';

/**
 * APP_INITIALIZER factory — runs before first render.
 * Checks token validity before fetching cart to avoid a guaranteed 401
 * for unauthenticated users (which ErrorInterceptor would intercept).
 * initCart() swallows all HTTP errors internally — bootstrap never fails (T-04-02 mitigation).
 * T-04-04: unauthenticated users never trigger GET /cart, avoiding unnecessary 401 logging.
 */
export function cartInitializerFactory(
  cartService: CartService,
  tokenService: TokenService
): () => Promise<void> {
  return () => {
    if (!tokenService.isTokenValid()) {
      return Promise.resolve();
    }
    return cartService.initCart();
  };
}

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    // CRITICAL: AuthInterceptor MUST be first — adds Bearer token before ErrorInterceptor processes responses
    // Reversing this order causes an infinite 401 redirect loop (see RESEARCH.md Pitfall 3)
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthGuard,
    RoleGuard,
    // Cart init — multi: true is MANDATORY; omitting it replaces all other initializers
    {
      provide: APP_INITIALIZER,
      useFactory: cartInitializerFactory,
      deps: [CartService, TokenService],
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}
