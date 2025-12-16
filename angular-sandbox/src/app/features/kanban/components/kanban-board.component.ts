import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Column } from '../models/board.model';
import { TaskStatus } from '../models/task.model';
import { KanbanStateService } from '../services/kanban-state.service';
import { KanbanColumnComponent } from './kanban-column.component';

@Component({
  selector: 'app-kanban-board',
  imports: [KanbanColumnComponent],
  template: `
    <div class="kanban-container">
      <div class="kanban-header">
        <h1>Kanban Board</h1>
        <div class="header-actions">
          <button 
            class="btn btn-refresh" 
            (click)="onRefresh()"
            [disabled]="isLoading()"
            type="button">
            {{ isLoading() ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      @if (error()) {
        <div class="error-banner">
          <span>⚠️ {{ error() }}</span>
          <button 
            class="btn-close" 
            (click)="onDismissError()"
            type="button">
            &times;
          </button>
        </div>
      }

      @if (isLoading() && !board()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading board...</p>
        </div>
      }

      @if (board() && !isLoading()) {
        <div class="board">
          @for (column of board()!.columns; track column.id) {
            <app-kanban-column
              [column]="column"
              [connectedLists]="columnIds()"
              (onDrop)="onTaskDrop($event)"
              (onDeleteTask)="onDeleteTask($event)" />
          }
        </div>
      }

      @if (!board() && !isLoading() && !error()) {
        <div class="empty-board">
          <p>No board data available. Click Refresh to load.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .kanban-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      background: #ffffff;
    }

    .kanban-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e1e4e8;
    }

    .kanban-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #24292e;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #d1d5da;
      border-radius: 6px;
      background: white;
      color: #24292e;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover:not(:disabled) {
      background: #f6f8fa;
      border-color: #959da5;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-refresh {
      background: #0366d6;
      color: white;
      border-color: #0366d6;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #0256c7;
    }

    .error-banner {
      background: #ffeef0;
      border: 1px solid #fdaeb7;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #86181d;
    }

    .btn-close {
      background: none;
      border: none;
      color: #86181d;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #586069;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f6f8fa;
      border-top-color: #0366d6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state p {
      margin-top: 16px;
      font-size: 14px;
    }

    .board {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 16px;
      min-height: 500px;
    }

    .empty-board {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      color: #959da5;
      font-size: 16px;
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  private readonly stateService = inject(KanbanStateService);

  // Public signals
  readonly board = this.stateService.board;
  readonly isLoading = this.stateService.isLoading;
  readonly error = this.stateService.error;

  // Computed signal for column IDs (for drag-drop connections)
  readonly columnIds = computed(() => 
    this.board()?.columns.map(col => col.id) ?? []
  );

  ngOnInit(): void {
    this.stateService.loadBoard();
  }

  onRefresh(): void {
    this.stateService.loadBoard(true);
  }

  onDismissError(): void {
    this.stateService.clearError();
  }

  onTaskDrop(event: CdkDragDrop<any>): void {
    const { previousContainer, container, previousIndex, currentIndex } = event;

    if (previousContainer === container) {
      // Reorder within same column
      const column = this.board()?.columns.find(col => col.id === container.id);
      if (column) {
        moveItemInArray(column.tasks, previousIndex, currentIndex);
        
        // Update order for affected tasks
        const task = column.tasks[currentIndex];
        this.stateService.updateTask(task.id, { order: currentIndex });
      }
    } else {
      // Move between columns
      const sourceColumn = this.board()?.columns.find(col => col.id === previousContainer.id);
      const targetColumn = this.board()?.columns.find(col => col.id === container.id);

      if (sourceColumn && targetColumn) {
        const task = sourceColumn.tasks[previousIndex];
        
        transferArrayItem(
          sourceColumn.tasks,
          targetColumn.tasks,
          previousIndex,
          currentIndex
        );

        // Update task status and order
        this.stateService.moveTask(
          task.id,
          targetColumn.status as TaskStatus,
          currentIndex
        );
      }
    }
  }

  onDeleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.stateService.deleteTask(taskId);
    }
  }
}
