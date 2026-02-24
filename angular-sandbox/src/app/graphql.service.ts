import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface GraphQLResponse<T> {
  data: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

const GET_USER_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GraphQLService {
  private readonly endpoint = '/graphql';

  constructor(private http: HttpClient) {}

  private query<T>(queryString: string, variables?: Record<string, unknown>): Observable<T> {
    return this.http
      .post<GraphQLResponse<T>>(this.endpoint, { query: queryString, variables })
      .pipe(
        switchMap((response) => {
          if (response.errors && response.errors.length > 0) {
            const message = response.errors.map((e) => e.message).join(', ');
            return throwError(() => new Error(message));
          }
          return [response.data];
        }),
        catchError((error: HttpErrorResponse | Error) => {
          const message =
            error instanceof HttpErrorResponse
              ? `Network error: ${error.message}`
              : error.message;
          return throwError(() => new Error(message));
        }),
      );
  }

  getUser(id: string): Observable<User> {
    return this.query<{ user: User }>(GET_USER_QUERY, { id }).pipe(
      map((data) => data.user),
    );
  }
}
