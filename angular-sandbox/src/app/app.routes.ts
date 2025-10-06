import { Routes } from '@angular/router';
import { ApolloDemo } from './apollo-demo/apollo-demo.component';
import { ComboboxDemo } from './combobox-demo/combobox-demo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/apollo', pathMatch: 'full' },
  { path: 'combobox', component: ComboboxDemo },
  { path: 'apollo', component: ApolloDemo },
];
