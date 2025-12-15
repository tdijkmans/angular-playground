import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, shareReplay, of } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

/**
 * UserService provides CRUD operations for User entities
 * using modern Angular patterns with HttpClient and caching
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';
  
  // Cache for users list
  private usersCache = signal<User[] | null>(null);
  private cacheTimestamp = signal<number>(0);
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch all users with caching support
   */
  getUsers(forceRefresh = false): Observable<User[]> {
    const now = Date.now();
    const cache = this.usersCache();
    const cacheAge = now - this.cacheTimestamp();

    // Return cached data if available and fresh
    if (!forceRefresh && cache && cacheAge < this.CACHE_DURATION) {
      console.log('Returning cached users data');
      return of(cache);
    }

    console.log('Fetching users from API');
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => {
        this.usersCache.set(users);
        this.cacheTimestamp.set(now);
      }),
      shareReplay(1)
    );
  }

  /**
   * Fetch a single user by ID
   */
  getUser(id: number): Observable<User> {
    // Check cache first
    const cache = this.usersCache();
    if (cache) {
      const cachedUser = cache.find(u => u.id === id);
      if (cachedUser) {
        console.log('Returning cached user data for id:', id);
        return of(cachedUser);
      }
    }

    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData).pipe(
      tap(newUser => this.invalidateCache())
    );
  }

  /**
   * Update an existing user
   */
  updateUser(userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userData.id}`, userData).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Delete a user by ID
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Invalidate the cache to force a refresh on next request
   */
  invalidateCache(): void {
    this.usersCache.set(null);
    this.cacheTimestamp.set(0);
  }

  /**
   * Get current cache status
   */
  getCacheStatus(): { cached: boolean; age: number } {
    const cache = this.usersCache();
    const age = Date.now() - this.cacheTimestamp();
    return {
      cached: cache !== null && age < this.CACHE_DURATION,
      age
    };
  }
}
