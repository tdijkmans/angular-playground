import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsersComponent } from './users.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let httpMock: HttpTestingController;
  let userService: UserService;

  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', website: 'john.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321', website: 'jane.com' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
    
    // Handle initial load request
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockUsers);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('User Management');
  });

  it('should have create and refresh buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should open create form when create button is clicked', () => {
    expect(component['isCreating']()).toBe(false);
    component['openCreateForm']();
    expect(component['isCreating']()).toBe(true);
  });

  it('should close form when cancel is called', () => {
    component['openCreateForm']();
    expect(component['isCreating']()).toBe(true);
    component['cancelForm']();
    expect(component['isCreating']()).toBe(false);
  });

  it('should perform optimistic update on user creation', () => {
    const initialCount = component['users']().length;
    
    component['openCreateForm']();
    component['formData'].set({
      name: 'New User',
      email: 'new@example.com',
      phone: '111-222-3333',
      website: 'newuser.com'
    });

    component['createUser']();
    
    // Verify optimistic update (user added immediately)
    expect(component['users']().length).toBe(initialCount + 1);
    expect(component['users']()[initialCount].name).toBe('New User');

    // Handle the HTTP request
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 999, name: 'New User', email: 'new@example.com', phone: '111-222-3333', website: 'newuser.com' });
  });

  it('should perform optimistic update on user deletion', () => {
    const initialCount = component['users']().length;
    const userToDelete = component['users']()[0];
    
    spyOn(window, 'confirm').and.returnValue(true);
    component['deleteUser'](userToDelete);
    
    // Verify optimistic update (user removed immediately)
    expect(component['users']().length).toBe(initialCount - 1);
    expect(component['users']().find(u => u.id === userToDelete.id)).toBeUndefined();

    // Handle the HTTP request
    const req = httpMock.expectOne(`https://jsonplaceholder.typicode.com/users/${userToDelete.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
