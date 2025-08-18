import { Routes } from '@angular/router';
import { TddExplanation } from './tdd-explanation/tdd-explanation';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home').then(m => m.Home) },
  { path: 'tdd', component: TddExplanation },
  { path: '**', redirectTo: '/home' }
];
