import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', website: 'john.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321', website: 'jane.com' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.invalidateCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users from API on first call', (done) => {
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
      expect(users.length).toBe(2);
      done();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should return cached users on subsequent calls', (done) => {
    // First call - fetches from API
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);

      // Second call - should use cache
      service.getUsers().subscribe(cachedUsers => {
        expect(cachedUsers).toEqual(mockUsers);
        done();
      });
    });

    // Only one HTTP request should be made
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
  });

  it('should bypass cache when forceRefresh is true', (done) => {
    // First call - fetches from API
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);

      // Second call with forceRefresh - should fetch again
      service.getUsers(true).subscribe(refreshedUsers => {
        expect(refreshedUsers).toEqual(mockUsers);
        done();
      });

      // Second HTTP request expected
      const req2 = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
      req2.flush(mockUsers);
    });

    // First HTTP request
    const req1 = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req1.flush(mockUsers);
  });

  it('should invalidate cache after creating a user', (done) => {
    const newUser = { name: 'New User', email: 'new@example.com', phone: '111-222-3333', website: 'new.com' };

    service.createUser(newUser).subscribe(() => {
      const cacheStatus = service.getCacheStatus();
      expect(cacheStatus.cached).toBe(false);
      done();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 3, ...newUser });
  });

  it('should invalidate cache after updating a user', (done) => {
    const updatedUser = { id: 1, name: 'Updated Name', email: 'updated@example.com', phone: '111-111-1111', website: 'updated.com' };

    service.updateUser(updatedUser).subscribe(() => {
      const cacheStatus = service.getCacheStatus();
      expect(cacheStatus.cached).toBe(false);
      done();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedUser);
  });

  it('should invalidate cache after deleting a user', (done) => {
    service.deleteUser(1).subscribe(() => {
      const cacheStatus = service.getCacheStatus();
      expect(cacheStatus.cached).toBe(false);
      done();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should return cached user when getting single user by ID', (done) => {
    // First populate cache
    service.getUsers().subscribe(() => {
      // Now get single user - should come from cache
      service.getUser(1).subscribe(user => {
        expect(user.id).toBe(1);
        expect(user.name).toBe('John Doe');
        done();
      });
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
  });

  it('should provide cache status information', (done) => {
    const statusBefore = service.getCacheStatus();
    expect(statusBefore.cached).toBe(false);

    service.getUsers().subscribe(() => {
      const statusAfter = service.getCacheStatus();
      expect(statusAfter.cached).toBe(true);
      expect(statusAfter.age).toBeLessThan(1000); // Less than 1 second old
      done();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
  });
});
