import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'accordion',
    loadComponent: () =>
      import('./accordion-demo/accordion-demo.component').then(m => m.AccordionDemoComponent),
  },
  {
    path: '',
    redirectTo: 'accordion',
    pathMatch: 'full',
  },
];
