import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, tap } from 'rxjs';
import { Board, Column, DEFAULT_COLUMNS } from '../models/board.model';
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from '../models/task.model';
import { KanbanApiService } from './kanban-api.service';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface KanbanState {
  board: Board | null;
  loading: LoadingState;
  error: string | null;
  lastUpdate: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class KanbanStateService {
  private readonly apiService = inject(KanbanApiService);

  // Private writable signals
  private readonly _state: WritableSignal<KanbanState> = signal({
    board: null,
    loading: 'idle',
    error: null,
    lastUpdate: null,
  });

  // Snapshot for optimistic update rollback
  private stateSnapshot: KanbanState | null = null;

  // Public read-only signals
  readonly state: Signal<KanbanState> = this._state.asReadonly();
  readonly board: Signal<Board | null> = computed(() => this._state().board);
  readonly loading: Signal<LoadingState> = computed(() => this._state().loading);
  readonly error: Signal<string | null> = computed(() => this._state().error);
  readonly isLoading: Signal<boolean> = computed(() => this._state().loading === 'loading');

  /**
   * Load board data from API
   */
  loadBoard(forceRefresh = false): void {
    const currentState = this._state();
    
    // Skip if already loading
    if (currentState.loading === 'loading') {
      return;
    }

    // Skip if we have fresh data (< 5 minutes old) and not forcing refresh
    if (!forceRefresh && currentState.board && currentState.lastUpdate) {
      const age = Date.now() - currentState.lastUpdate.getTime();
      if (age < 5 * 60 * 1000) { // 5 minutes
        return;
      }
    }

    this._state.update(state => ({
      ...state,
      loading: 'loading',
      error: null,
    }));

    this.apiService.getTasks().pipe(
      tap(tasks => {
        const board = this.createBoardFromTasks(tasks);
        this._state.update(state => ({
          ...state,
          board,
          loading: 'success',
          lastUpdate: new Date(),
        }));
      }),
      catchError(error => {
        console.error('Failed to load board:', error);
        this._state.update(state => ({
          ...state,
          loading: 'error',
          error: error.message || 'Failed to load board',
        }));
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Create a new task
   */
  createTask(dto: CreateTaskDto): void {
    this.apiService.createTask(dto).pipe(
      tap(newTask => {
        this._state.update(state => {
          if (!state.board) return state;

          const updatedBoard = { ...state.board };
          const column = updatedBoard.columns.find(col => col.status === newTask.status);
          
          if (column) {
            column.tasks = [...column.tasks, newTask];
          }

          return {
            ...state,
            board: updatedBoard,
          };
        });
      }),
      catchError(error => {
        console.error('Failed to create task:', error);
        this._state.update(state => ({
          ...state,
          error: error.message || 'Failed to create task',
        }));
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Update task with optimistic update
   */
  updateTask(id: number, dto: UpdateTaskDto): void {
    // Save snapshot for rollback
    this.takeSnapshot();

    // Optimistic update
    this._state.update(state => {
      if (!state.board) return state;

      const updatedBoard = { ...state.board };
      let taskFound = false;

      for (const column of updatedBoard.columns) {
        const taskIndex = column.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          const updatedTask = { ...column.tasks[taskIndex], ...dto, updatedAt: new Date().toISOString() };
          
          // If status changed, move to new column
          if (dto.status && dto.status !== column.status) {
            column.tasks = column.tasks.filter(t => t.id !== id);
            const newColumn = updatedBoard.columns.find(col => col.status === dto.status);
            if (newColumn) {
              newColumn.tasks = [...newColumn.tasks, updatedTask];
            }
          } else {
            // Update in place
            column.tasks = [
              ...column.tasks.slice(0, taskIndex),
              updatedTask,
              ...column.tasks.slice(taskIndex + 1),
            ];
          }
          
          taskFound = true;
          break;
        }
      }

      return { ...state, board: updatedBoard };
    });

    // Persist to API
    this.apiService.updateTask(id, dto).pipe(
      catchError(error => {
        console.error('Failed to update task:', error);
        this.rollbackSnapshot();
        this._state.update(state => ({
          ...state,
          error: error.message || 'Failed to update task',
        }));
        return of(null);
      }),
      finalize(() => {
        this.clearSnapshot();
      })
    ).subscribe();
  }

  /**
   * Delete task with optimistic update
   */
  deleteTask(id: number): void {
    // Save snapshot for rollback
    this.takeSnapshot();

    // Optimistic delete
    this._state.update(state => {
      if (!state.board) return state;

      const updatedBoard = { ...state.board };
      
      for (const column of updatedBoard.columns) {
        const taskIndex = column.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          column.tasks = column.tasks.filter(t => t.id !== id);
          break;
        }
      }

      return { ...state, board: updatedBoard };
    });

    // Persist to API
    this.apiService.deleteTask(id).pipe(
      catchError(error => {
        console.error('Failed to delete task:', error);
        this.rollbackSnapshot();
        this._state.update(state => ({
          ...state,
          error: error.message || 'Failed to delete task',
        }));
        return of(null);
      }),
      finalize(() => {
        this.clearSnapshot();
      })
    ).subscribe();
  }

  /**
   * Move task between columns or reorder within column
   */
  moveTask(taskId: number, targetStatus: TaskStatus, newOrder: number): void {
    this.updateTask(taskId, { status: targetStatus, order: newOrder });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._state.update(state => ({ ...state, error: null }));
  }

  /**
   * Take a snapshot of current state for rollback
   */
  private takeSnapshot(): void {
    this.stateSnapshot = { ...this._state() };
  }

  /**
   * Rollback to snapshot
   */
  private rollbackSnapshot(): void {
    if (this.stateSnapshot) {
      this._state.set(this.stateSnapshot);
    }
  }

  /**
   * Clear snapshot
   */
  private clearSnapshot(): void {
    this.stateSnapshot = null;
  }

  /**
   * Create board structure from flat task list
   */
  private createBoardFromTasks(tasks: Task[]): Board {
    const columns: Column[] = DEFAULT_COLUMNS.map(col => ({
      ...col,
      tasks: tasks
        .filter(task => task.status === col.status)
        .sort((a, b) => a.order - b.order),
    }));

    return {
      columns,
      lastFetched: new Date(),
    };
  }
}
