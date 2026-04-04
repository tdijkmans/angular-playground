import { Routes } from '@angular/router';

import { ContainerQueryDemoComponent } from './pages/container-query-demo';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'container-query',
	},
	{
		path: 'container-query',
		component: ContainerQueryDemoComponent,
	},
];
