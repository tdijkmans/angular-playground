import { Routes } from '@angular/router';

import { AccordionDemoComponent } from './pages/accordion-demo/accordion-demo';
import { AutoSaveDemoComponent } from './pages/auto-save-demo/auto-save-demo';
import { ContainerQueryDemoComponent } from './pages/container-query-demo/container-query-demo';

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
	{
		path: 'accordion',
		component: AccordionDemoComponent,
	},
	{
		path: 'auto-save',
		component: AutoSaveDemoComponent,
	},
];
