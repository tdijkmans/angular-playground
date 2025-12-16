import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { Column } from '../models/board.model';
import { Task } from '../models/task.model';
import { TaskCardComponent } from './task-card.component';

@Component({
  selector: 'app-kanban-column',
  imports: [CdkDropList, CdkDrag, TaskCardComponent],
  template: `
    <div class="column">
      <div class="column-header">
        <h2 class="column-title">{{ column().title }}</h2>
        <span class="column-count">{{ column().tasks.length }}</span>
      </div>
      
      <div 
        class="column-content"
        cdkDropList
        [cdkDropListData]="column().tasks"
        [id]="column().id"
        [cdkDropListConnectedTo]="connectedLists()"
        (cdkDropListDropped)="onDrop.emit($event)">
        
        @if (column().tasks.length === 0) {
          <div class="empty-state">
            <p>No tasks</p>
          </div>
        }
        
        @for (task of column().tasks; track task.id) {
          <div cdkDrag [cdkDragData]="task">
            <app-task-card 
              [task]="task"
              (deleteTask)="onDeleteTask.emit($event)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .column {
      background: #f6f8fa;
      border-radius: 8px;
      padding: 12px;
      min-width: 300px;
      max-width: 350px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e1e4e8;
    }

    .column-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #24292e;
    }

    .column-count {
      background: #e1e4e8;
      color: #586069;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .column-content {
      flex: 1;
      overflow-y: auto;
      min-height: 200px;
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 150px;
      color: #959da5;
      font-size: 14px;
    }

    .empty-state p {
      margin: 0;
    }

    /* CDK Drag styles */
    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      opacity: 0.8;
    }

    .cdk-drag-placeholder {
      opacity: 0.4;
      background: #dfe2e5;
      border: 2px dashed #959da5;
      border-radius: 6px;
      min-height: 60px;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .column-content.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class KanbanColumnComponent {
  column = input.required<Column>();
  connectedLists = input.required<string[]>();
  onDrop = output<any>();
  onDeleteTask = output<number>();
}
