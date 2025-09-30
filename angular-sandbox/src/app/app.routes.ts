import { Routes } from '@angular/router';
import { FocusDemoComponent } from './focus-demo/focus-demo.component';
import { ComboboxDemoComponent } from './combobox-demo/combobox-demo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/combobox', pathMatch: 'full' },
  { path: 'combobox', component: ComboboxDemoComponent },
  { path: 'focus-demo', component: FocusDemoComponent }
];
