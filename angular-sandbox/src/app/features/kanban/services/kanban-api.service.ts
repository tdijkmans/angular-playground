import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay, map, of } from 'rxjs';
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from '../models/task.model';

interface JsonPlaceholderTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KanbanApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://jsonplaceholder.typicode.com';
  
  // In-memory store to simulate a real API with persistence
  private localTasks: Task[] = [];
  private nextId = 1000; // Start with high ID to avoid conflicts with JSONPlaceholder

  /**
   * Fetch all tasks from the API
   * In production, this would be a real API endpoint
   * For demo, we transform JSONPlaceholder todos into our task model
   */
  getTasks(): Observable<Task[]> {
    // If we have local tasks, return them (simulating persistence)
    if (this.localTasks.length > 0) {
      return of(this.localTasks).pipe(delay(300));
    }

    // Try to fetch from JSONPlaceholder, but fallback to mock data if it fails
    return this.http.get<JsonPlaceholderTodo[]>(`${this.API_URL}/todos?_limit=15`).pipe(
      delay(300),
      map(todos => {
        this.localTasks = todos.map((todo, index) => this.transformTodoToTask(todo, index));
        return this.localTasks;
      }),
      catchError(() => {
        // Fallback to mock data if API fails
        this.localTasks = this.generateMockTasks();
        return of(this.localTasks).pipe(delay(300));
      })
    );
  }

  /**
   * Create a new task
   */
  createTask(dto: CreateTaskDto): Observable<Task> {
    const newTask: Task = {
      id: this.nextId++,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      order: dto.order,
      userId: dto.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate API delay
    return of(newTask).pipe(
      delay(300),
      map(task => {
        this.localTasks.push(task);
        return task;
      })
    );
  }

  /**
   * Update an existing task
   */
  updateTask(id: number, dto: UpdateTaskDto): Observable<Task> {
    const taskIndex = this.localTasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask: Task = {
      ...this.localTasks[taskIndex],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    // Simulate API delay
    return of(updatedTask).pipe(
      delay(300),
      map(task => {
        this.localTasks[taskIndex] = task;
        return task;
      })
    );
  }

  /**
   * Delete a task
   */
  deleteTask(id: number): Observable<void> {
    const taskIndex = this.localTasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    // Simulate API delay
    return of(void 0).pipe(
      delay(300),
      map(() => {
        this.localTasks.splice(taskIndex, 1);
      })
    );
  }

  /**
   * Transform JSONPlaceholder todo into our task model
   */
  private transformTodoToTask(todo: JsonPlaceholderTodo, index: number): Task {
    // Distribute tasks across columns
    const status: TaskStatus = 
      index % 3 === 0 ? 'todo' : 
      index % 3 === 1 ? 'in_progress' : 
      'done';

    return {
      id: todo.id,
      title: todo.title,
      description: `Task description for ${todo.title}`,
      status,
      order: index,
      userId: todo.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate mock tasks for demo purposes
   */
  private generateMockTasks(): Task[] {
    const mockTasks = [
      { id: 1, title: 'Design new landing page', status: 'todo' as TaskStatus, userId: 1 },
      { id: 2, title: 'Implement user authentication', status: 'in_progress' as TaskStatus, userId: 2 },
      { id: 3, title: 'Write unit tests for API', status: 'done' as TaskStatus, userId: 1 },
      { id: 4, title: 'Update documentation', status: 'todo' as TaskStatus, userId: 3 },
      { id: 5, title: 'Fix responsive layout issues', status: 'in_progress' as TaskStatus, userId: 2 },
      { id: 6, title: 'Code review PR #123', status: 'done' as TaskStatus, userId: 3 },
      { id: 7, title: 'Optimize database queries', status: 'todo' as TaskStatus, userId: 1 },
      { id: 8, title: 'Set up CI/CD pipeline', status: 'in_progress' as TaskStatus, userId: 2 },
      { id: 9, title: 'Deploy to staging environment', status: 'done' as TaskStatus, userId: 3 },
      { id: 10, title: 'Refactor legacy code', status: 'todo' as TaskStatus, userId: 1 },
      { id: 11, title: 'Add loading indicators', status: 'in_progress' as TaskStatus, userId: 2 },
      { id: 12, title: 'Update dependencies', status: 'done' as TaskStatus, userId: 3 },
      { id: 13, title: 'Create user onboarding flow', status: 'todo' as TaskStatus, userId: 1 },
      { id: 14, title: 'Implement dark mode', status: 'in_progress' as TaskStatus, userId: 2 },
      { id: 15, title: 'Performance optimization', status: 'done' as TaskStatus, userId: 3 },
    ];

    return mockTasks.map((task, index) => ({
      id: task.id,
      title: task.title,
      description: `Description for: ${task.title}`,
      status: task.status,
      order: index,
      userId: task.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}
