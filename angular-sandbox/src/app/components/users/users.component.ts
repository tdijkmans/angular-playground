import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, CreateUserDto, UpdateUserDto } from '../../models/user.model';

/**
 * UsersComponent demonstrates modern Angular CRUD operations
 * using reactive patterns with signals
 */
@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  private readonly userService = inject(UserService);

  // Signals for reactive state management
  protected readonly users = signal<User[]>([]);
  protected readonly selectedUser = signal<User | null>(null);
  protected readonly isEditing = signal(false);
  protected readonly isCreating = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Form state
  protected readonly formData = signal<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    website: ''
  });

  constructor() {
    // Initial load
    this.loadUsers();
  }

  /**
   * Load users from the API (uses cache if available)
   */
  private loadUsers(forceRefresh = false): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.userService.getUsers(forceRefresh).subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error.set('Failed to load users');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Open create form
   */
  protected openCreateForm(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedUser.set(null);
    this.formData.set({
      name: '',
      email: '',
      phone: '',
      website: ''
    });
  }

  /**
   * Open edit form for a user
   */
  protected openEditForm(user: User): void {
    this.isEditing.set(true);
    this.isCreating.set(false);
    this.selectedUser.set(user);
    this.formData.set({ ...user });
  }

  /**
   * Cancel form and reset state
   */
  protected cancelForm(): void {
    this.isCreating.set(false);
    this.isEditing.set(false);
    this.selectedUser.set(null);
    this.formData.set({
      name: '',
      email: '',
      phone: '',
      website: ''
    });
  }

  /**
   * Create a new user with optimistic update
   */
  protected createUser(): void {
    const userData = this.formData();
    if (!userData.name || !userData.email) {
      alert('Name and email are required');
      return;
    }

    const createDto: CreateUserDto = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      website: userData.website
    };

    // Optimistic update: Add user to UI immediately with temporary ID
    const optimisticUser: User = {
      id: Date.now(), // Temporary ID
      ...createDto
    };
    
    const currentUsers = this.users();
    this.users.set([...currentUsers, optimisticUser]);
    this.cancelForm();

    // Make API call
    this.userService.createUser(createDto).subscribe({
      next: (newUser) => {
        console.log('User created:', newUser);
        // Replace optimistic user with real user from server
        this.users.update(users => 
          users.map(u => u.id === optimisticUser.id ? newUser : u)
        );
      },
      error: (error) => {
        console.error('Error creating user:', error);
        alert('Failed to create user');
        // Rollback optimistic update
        this.users.update(users => 
          users.filter(u => u.id !== optimisticUser.id)
        );
      }
    });
  }

  /**
   * Update an existing user with optimistic update
   */
  protected updateUser(): void {
    const userData = this.formData();
    const selected = this.selectedUser();
    
    if (!selected || !userData.name || !userData.email) {
      alert('Name and email are required');
      return;
    }

    const updateDto: UpdateUserDto = {
      id: selected.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      website: userData.website
    };

    // Store original user for rollback
    const originalUser = { ...selected };

    // Optimistic update: Update user in UI immediately
    this.users.update(users =>
      users.map(u => u.id === updateDto.id ? { ...updateDto } as User : u)
    );
    this.cancelForm();

    // Make API call
    this.userService.updateUser(updateDto).subscribe({
      next: (updatedUser) => {
        console.log('User updated:', updatedUser);
        // Update with server response (in case server modified data)
        this.users.update(users =>
          users.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert('Failed to update user');
        // Rollback optimistic update
        this.users.update(users =>
          users.map(u => u.id === originalUser.id ? originalUser : u)
        );
      }
    });
  }

  /**
   * Delete a user with optimistic update
   */
  protected deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    // Store original users list for rollback
    const originalUsers = [...this.users()];

    // Optimistic update: Remove user from UI immediately
    this.users.update(users => users.filter(u => u.id !== user.id));

    // Make API call
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        console.log('User deleted:', user.id);
        // Success - optimistic update was correct
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
        // Rollback optimistic update
        this.users.set(originalUsers);
      }
    });
  }

  /**
   * Refresh the users list (bypasses cache)
   */
  protected refresh(): void {
    this.loadUsers(true);
  }

  /**
   * Update form field
   */
  protected updateFormField(field: keyof User, value: string): void {
    this.formData.update(current => ({
      ...current,
      [field]: value
    }));
  }

  /**
   * Handle input event and update form field
   */
  protected onInputChange(event: Event, field: keyof User): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateFormField(field, value);
  }
}
