import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { KanbanApiService } from './kanban-api.service';
import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';

describe('KanbanApiService', () => {
  let service: KanbanApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [KanbanApiService]
    });
    service = TestBed.inject(KanbanApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should fetch tasks from API and transform them', (done) => {
      const mockTodos = [
        { userId: 1, id: 1, title: 'Test todo 1', completed: false },
        { userId: 1, id: 2, title: 'Test todo 2', completed: true },
      ];

      service.getTasks().subscribe(tasks => {
        expect(tasks.length).toBe(2);
        expect(tasks[0].title).toBe('Test todo 1');
        expect(tasks[0].status).toBeDefined();
        expect(tasks[0].description).toContain('Test todo 1');
        done();
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos?_limit=15');
      expect(req.request.method).toBe('GET');
      req.flush(mockTodos);
    });

    it('should return cached tasks on subsequent calls', (done) => {
      const mockTodos = [
        { userId: 1, id: 1, title: 'Test todo', completed: false },
      ];

      // First call
      service.getTasks().subscribe(() => {
        // Second call should use cache
        service.getTasks().subscribe(tasks => {
          expect(tasks.length).toBe(1);
          done();
        });
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos?_limit=15');
      req.flush(mockTodos);
    });

    it('should fallback to mock data when API fails', (done) => {
      service.getTasks().subscribe(tasks => {
        expect(tasks.length).toBeGreaterThan(0);
        expect(tasks[0].title).toBeDefined();
        done();
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos?_limit=15');
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('createTask', () => {
    it('should create a new task', (done) => {
      const dto: CreateTaskDto = {
        title: 'New Task',
        description: 'Test description',
        status: 'todo',
        order: 0,
        userId: 1,
      };

      service.createTask(dto).subscribe(task => {
        expect(task.title).toBe('New Task');
        expect(task.description).toBe('Test description');
        expect(task.status).toBe('todo');
        expect(task.id).toBeDefined();
        done();
      });
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', (done) => {
      const mockTodos = [
        { userId: 1, id: 1, title: 'Test todo', completed: false },
      ];

      // First create a task
      service.getTasks().subscribe(() => {
        const dto: UpdateTaskDto = {
          title: 'Updated Title',
          status: 'in_progress',
        };

        service.updateTask(1, dto).subscribe(task => {
          expect(task.title).toBe('Updated Title');
          expect(task.status).toBe('in_progress');
          done();
        });
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos?_limit=15');
      req.flush(mockTodos);
    });

    it('should return error observable when task not found', (done) => {
      service.updateTask(999, { title: 'Test' }).subscribe({
        next: () => fail('should have thrown error'),
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        }
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', (done) => {
      const mockTodos = [
        { userId: 1, id: 1, title: 'Test todo', completed: false },
      ];

      let requestCount = 0;
      service.getTasks().subscribe(() => {
        service.deleteTask(1).subscribe(() => {
          done();
        });
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos?_limit=15');
      req.flush(mockTodos);
    });

    it('should return error observable when task not found', (done) => {
      service.deleteTask(999).subscribe({
        next: () => fail('should have thrown error'),
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        }
      });
    });
  });
});
