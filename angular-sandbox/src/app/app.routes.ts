import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'container-query',
    loadComponent: () =>
      import('./container-query/container-query-demo.component').then(
        (m) => m.ContainerQueryDemoComponent
      ),
  },
];
