import { Task, TaskStatus } from './task.model';

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

export interface Board {
  columns: Column[];
  lastFetched?: Date;
}

export const DEFAULT_COLUMNS: Omit<Column, 'tasks'>[] = [
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'done', title: 'Done', status: 'done' },
];
