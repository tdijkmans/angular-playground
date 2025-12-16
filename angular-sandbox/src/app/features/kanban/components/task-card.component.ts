import { Component, input, output } from '@angular/core';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [],
  template: `
    <div class="task-card">
      <div class="task-header">
        <h3 class="task-title">{{ task().title }}</h3>
        <button 
          class="task-delete"
          (click)="onDelete()"
          type="button"
          aria-label="Delete task"
          title="Delete task">
          &times;
        </button>
      </div>
      <p class="task-description">{{ task().description }}</p>
      <div class="task-meta">
        <span class="task-id">#{{ task().id }}</span>
        <span class="task-user">User {{ task().userId }}</span>
      </div>
    </div>
  `,
  styles: [`
    .task-card {
      background: white;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
      cursor: move;
      transition: box-shadow 0.2s ease;
    }

    .task-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .task-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #24292e;
      flex: 1;
      line-height: 1.4;
    }

    .task-delete {
      background: none;
      border: none;
      color: #586069;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      margin-left: 8px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .task-delete:hover {
      background-color: #f6f8fa;
      color: #d73a49;
    }

    .task-description {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #586069;
      line-height: 1.5;
    }

    .task-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #959da5;
    }

    .task-id, .task-user {
      font-weight: 500;
    }
  `]
})
export class TaskCardComponent {
  task = input.required<Task>();
  deleteTask = output<number>();

  onDelete(): void {
    this.deleteTask.emit(this.task().id);
  }
}
