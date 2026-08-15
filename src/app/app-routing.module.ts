import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/games',
    pathMatch: 'full',
  },
  {
    path: 'games',
    loadChildren: () =>
      import('./features/games/games.module').then(m => m.GamesModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart.module').then(m => m.CartModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.module').then(m => m.OrdersModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/user-profile/user-profile.module').then(m => m.UserProfileModule),
    canActivate: [AuthGuard],
  },
  {
    // Catch-all: unknown routes redirect to games
    path: '**',
    redirectTo: '/games',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableViewTransitions: true,         // Native View Transitions API for route fade — per UI-02
      scrollPositionRestoration: 'top',    // Restore scroll to top on route change
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
