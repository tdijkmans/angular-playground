import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'drawer-grid',
    loadComponent: () =>
      import('./drawer-grid/drawer-grid').then((m) => m.DrawerGrid),
  },
  { path: '', redirectTo: 'drawer-grid', pathMatch: 'full' },
];
