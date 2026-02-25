import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GraphQLRequest } from './graphql-query-builder';
import { GraphQLService, User } from './graphql.service';

describe('GraphQLService', () => {
  let service: GraphQLService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), GraphQLService],
    });
    service = TestBed.inject(GraphQLService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser', () => {
    it('should return a user on success', () => {
      const mockUser: User = { id: '1', name: 'Alice', email: 'alice@example.com' };

      service.getUser('1').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('/graphql');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(
        jasmine.objectContaining({ variables: { id: '1' } }),
      );
      req.flush({ data: { user: mockUser } });
    });

    it('should propagate GraphQL errors', () => {
      service.getUser('99').subscribe({
        next: () => fail('expected an error'),
        error: (err: Error) => {
          expect(err.message).toContain('User not found');
        },
      });

      const req = httpMock.expectOne('/graphql');
      req.flush({ data: null, errors: [{ message: 'User not found' }] });
    });

    it('should propagate network errors', () => {
      service.getUser('1').subscribe({
        next: () => fail('expected a network error'),
        error: (err: Error) => {
          expect(err.message).toContain('Network error');
        },
      });

      const req = httpMock.expectOne('/graphql');
      req.error(new ProgressEvent('network error'));
    });
  });

  describe('execute', () => {
    it('should send a typed request and return the data', () => {
      const mockUser: User = { id: '2', name: 'Bob', email: 'bob@example.com' };
      const request: GraphQLRequest<{ id: string }> = {
        query: 'query GetUser($id: ID!) { user(id: $id) { id name email } }',
        variables: { id: '2' },
      };

      service.execute<{ user: User }, { id: string }>(request).subscribe((data) => {
        expect(data.user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('/graphql');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(
        jasmine.objectContaining({ variables: { id: '2' } }),
      );
      req.flush({ data: { user: mockUser } });
    });
  });
});
