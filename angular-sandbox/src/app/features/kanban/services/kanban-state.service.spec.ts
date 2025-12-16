import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { KanbanStateService } from './kanban-state.service';
import { KanbanApiService } from './kanban-api.service';
import { Task } from '../models/task.model';

describe('KanbanStateService', () => {
  let service: KanbanStateService;
  let apiServiceSpy: jasmine.SpyObj<KanbanApiService>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'todo',
      order: 0,
      userId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'in_progress',
      order: 1,
      userId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Task 3',
      description: 'Description 3',
      status: 'done',
      order: 2,
      userId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('KanbanApiService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask'
    ]);

    TestBed.configureTestingModule({
      providers: [
        KanbanStateService,
        { provide: KanbanApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(KanbanStateService);
    apiServiceSpy = TestBed.inject(KanbanApiService) as jasmine.SpyObj<KanbanApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadBoard', () => {
    it('should load board and update state', (done) => {
      apiServiceSpy.getTasks.and.returnValue(of(mockTasks));

      service.loadBoard();

      setTimeout(() => {
        const board = service.board();
        expect(board).toBeTruthy();
        expect(board!.columns.length).toBe(3);
        expect(board!.columns[0].tasks.length).toBe(1);
        expect(board!.columns[1].tasks.length).toBe(1);
        expect(board!.columns[2].tasks.length).toBe(1);
        expect(service.loading()).toBe('success');
        done();
      }, 100);
    });

    it('should set error state when loading fails', (done) => {
      apiServiceSpy.getTasks.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      service.loadBoard();

      setTimeout(() => {
        expect(service.loading()).toBe('error');
        expect(service.error()).toBeTruthy();
        done();
      }, 100);
    });

    it('should skip loading if already loading', () => {
      apiServiceSpy.getTasks.and.returnValue(of(mockTasks));

      service.loadBoard();
      service.loadBoard(); // Second call should be skipped

      expect(apiServiceSpy.getTasks).toHaveBeenCalledTimes(1);
    });

    it('should skip loading if data is fresh and not forcing refresh', (done) => {
      apiServiceSpy.getTasks.and.returnValue(of(mockTasks));

      service.loadBoard();

      setTimeout(() => {
        service.loadBoard(); // Should skip because data is fresh
        expect(apiServiceSpy.getTasks).toHaveBeenCalledTimes(1);
        done();
      }, 100);
    });

    it('should reload when forcing refresh', (done) => {
      apiServiceSpy.getTasks.and.returnValue(of(mockTasks));

      service.loadBoard();

      setTimeout(() => {
        service.loadBoard(true); // Force refresh
        setTimeout(() => {
          expect(apiServiceSpy.getTasks).toHaveBeenCalledTimes(2);
          done();
        }, 100);
      }, 100);
    });
  });

  describe('updateTask with optimistic updates', () => {
    beforeEach((done) => {
      apiServiceSpy.getTasks.and.returnValue(of(mockTasks));
      service.loadBoard();
      setTimeout(done, 100);
    });

    it('should optimistically update task', (done) => {
      apiServiceSpy.updateTask.and.returnValue(of({
        ...mockTasks[0],
        title: 'Updated Task',
      }));

      const initialBoard = service.board();
      const initialTask = initialBoard!.columns[0].tasks[0];
      expect(initialTask.title).toBe('Task 1');

      service.updateTask(1, { title: 'Updated Task' });

      // Should be immediately updated (optimistic)
      const updatedBoard = service.board();
      const updatedTask = updatedBoard!.columns[0].tasks[0];
      expect(updatedTask.title).toBe('Updated Task');

      setTimeout(() => {
        expect(apiServiceSpy.updateTask).toHaveBeenCalledWith(1, { title: 'Updated Task' });
        done();
      }, 100);
    });

    it('should set error on API failure and rollback optimistic update', (done) => {
      apiServiceSpy.updateTask.and.returnValue(
        throwError(() => new Error('Update failed'))
      );

      const initialBoard = service.board();
      const initialTask = initialBoard!.columns[0].tasks[0];
      const initialTitle = initialTask.title;

      service.updateTask(1, { title: 'Updated Task' });

      setTimeout(() => {
        // Should set error after API failure
        expect(service.error()).toBeTruthy();
        expect(service.error()).toContain('Update failed');
        
        // Verify rollback happened by checking title is back to original
        const currentBoard = service.board();
        const currentTask = currentBoard!.columns[0].tasks[0];
        expect(currentTask.title).toBe(initialTitle);
        done();
      }, 100);
    });

    it('should move task between columns', (done) => {
      apiServiceSpy.updateTask.and.returnValue(of({
        ...mockTasks[0],
        status: 'in_progress',
      }));

      service.updateTask(1, { status: 'in_progress' });

      setTimeout(() => {
        const board = service.board();
        const todoColumn = board!.columns.find(col => col.status === 'todo');
        const inProgressColumn = board!.columns.find(col => col.status === 'in_progress');

        expect(todoColumn!.tasks.length).toBe(0);
        expect(inProgressColumn!.tasks.length).toBe(2);
        done();
      }, 100);
    });
  });

  describe('deleteTask with optimistic updates', () => {
    beforeEach((done) => {
      apiServiceSpy.getTasks.and.returnValue(of(mockTasks));
      service.loadBoard();
      setTimeout(done, 100);
    });

    it('should optimistically delete task', (done) => {
      apiServiceSpy.deleteTask.and.returnValue(of(void 0));

      const initialBoard = service.board();
      const initialCount = initialBoard!.columns[0].tasks.length;

      service.deleteTask(1);

      // Should be immediately deleted (optimistic)
      const updatedBoard = service.board();
      expect(updatedBoard!.columns[0].tasks.length).toBe(initialCount - 1);

      setTimeout(() => {
        expect(apiServiceSpy.deleteTask).toHaveBeenCalledWith(1);
        done();
      }, 100);
    });

    it('should set error on delete API failure and rollback', (done) => {
      apiServiceSpy.deleteTask.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );

      const initialBoard = service.board();
      const initialCount = initialBoard!.columns[0].tasks.length;

      service.deleteTask(1);

      setTimeout(() => {
        // Should set error after API failure
        expect(service.error()).toBeTruthy();
        expect(service.error()).toContain('Delete failed');
        
        // Verify rollback happened - task should still exist
        const currentBoard = service.board();
        const restoredTask = currentBoard!.columns[0].tasks.find(t => t.id === 1);
        expect(restoredTask).toBeTruthy();
        expect(currentBoard!.columns[0].tasks.length).toBe(initialCount);
        done();
      }, 100);
    });
  });

  describe('createTask', () => {
    beforeEach((done) => {
      apiServiceSpy.getTasks.and.returnValue(of(mockTasks));
      service.loadBoard();
      setTimeout(done, 100);
    });

    it('should create a new task', (done) => {
      const newTask: Task = {
        id: 4,
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        order: 3,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      apiServiceSpy.createTask.and.returnValue(of(newTask));

      const initialBoard = service.board();
      const initialCount = initialBoard!.columns[0].tasks.length;

      service.createTask({
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        order: 3,
        userId: 1,
      });

      setTimeout(() => {
        const updatedBoard = service.board();
        expect(updatedBoard!.columns[0].tasks.length).toBe(initialCount + 1);
        done();
      }, 100);
    });
  });

  describe('clearError', () => {
    it('should clear error state', (done) => {
      apiServiceSpy.getTasks.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      service.loadBoard();

      setTimeout(() => {
        expect(service.error()).toBeTruthy();
        service.clearError();
        expect(service.error()).toBeNull();
        done();
      }, 100);
    });
  });
});
