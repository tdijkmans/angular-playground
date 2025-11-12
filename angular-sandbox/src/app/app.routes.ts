import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { EventBasedPageComponent } from './pages/event-based-page.component';
import { FormBasedPageComponent } from './pages/form-based-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'event-based', component: EventBasedPageComponent },
  { path: 'form-based', component: FormBasedPageComponent },
];
