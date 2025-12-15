import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

/**
 * UserService provides CRUD operations for User entities
 * using modern Angular patterns with HttpClient
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';

  /**
   * Fetch all users
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Fetch a single user by ID
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  /**
   * Update an existing user
   */
  updateUser(userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userData.id}`, userData);
  }

  /**
   * Delete a user by ID
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
