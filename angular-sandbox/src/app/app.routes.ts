import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'accordion',
    loadComponent: () =>
      import('./accordion-demo/accordion-demo').then((m) => m.AccordionDemo),
  },
  { path: '', redirectTo: 'accordion', pathMatch: 'full' },
];
