import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'kanban',
    loadComponent: () => import('./features/kanban/components/kanban-board.component').then(m => m.KanbanBoardComponent),
  },
  {
    path: '',
    redirectTo: '/kanban',
    pathMatch: 'full',
  },
];
