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
   * Load users from the API
   */
  private loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.userService.getUsers().subscribe({
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
   * Create a new user
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

    this.userService.createUser(createDto).subscribe({
      next: (newUser) => {
        console.log('User created:', newUser);
        this.cancelForm();
        this.refresh();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        alert('Failed to create user');
      }
    });
  }

  /**
   * Update an existing user
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

    this.userService.updateUser(updateDto).subscribe({
      next: (updatedUser) => {
        console.log('User updated:', updatedUser);
        this.cancelForm();
        this.refresh();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert('Failed to update user');
      }
    });
  }

  /**
   * Delete a user
   */
  protected deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        console.log('User deleted:', user.id);
        this.refresh();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    });
  }

  /**
   * Refresh the users list
   */
  protected refresh(): void {
    this.loadUsers();
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
}
