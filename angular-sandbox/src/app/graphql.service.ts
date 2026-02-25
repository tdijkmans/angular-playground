import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { GraphQLQueryBuilder, GraphQLRequest } from './graphql-query-builder';

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

interface GetUserVariables {
  id: string;
}

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

  /**
   * Execute any typed GraphQL request built with {@link GraphQLQueryBuilder}.
   * `TData` is the shape of `response.data`; `TVariables` types the variables payload.
   */
  execute<TData, TVariables = Record<string, unknown>>(
    request: GraphQLRequest<TVariables>,
  ): Observable<TData> {
    return this.query<TData>(request.query, request.variables as Record<string, unknown>);
  }

  getUser(id: string): Observable<User> {
    const queryString = new GraphQLQueryBuilder()
      .operation('query', 'GetUser')
      .withVariable('id', 'ID!')
      .select({ name: 'user', args: { id: '$id' }, fields: ['id', 'name', 'email'] })
      .build();

    return this.execute<{ user: User }, GetUserVariables>({
      query: queryString,
      variables: { id },
    }).pipe(map((data) => data.user));
  }
}
