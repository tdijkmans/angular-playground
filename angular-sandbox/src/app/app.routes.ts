import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'map',
    loadComponent: () =>
      import('./location-tracker/location-tracker.component').then(
        (m) => m.LocationTrackerComponent
      ),
  },
  { path: '', redirectTo: 'map', pathMatch: 'full' },
];
