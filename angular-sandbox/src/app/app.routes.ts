import { Routes } from '@angular/router';
import { ZaakProfiel } from './zaakprofiel/zaak-profiel.component';

export const routes: Routes = [
    { path: '', redirectTo: '/zaakprofiel/3', pathMatch: 'full' },
    {path: 'zaakprofiel/:zaakid', component: ZaakProfiel}
];
