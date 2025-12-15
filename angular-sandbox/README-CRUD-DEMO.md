# Modern Angular CRUD Demo

This project demonstrates modern Angular data CRUD patterns with best practices.

## Features Demonstrated

### 1. **Modern Angular Architecture (v20+)**
- Standalone components (no NgModules)
- Signal-based reactive state management
- Functional dependency injection using `inject()`
- New control flow syntax (`@if`, `@for`)
- Lazy-loaded routes

### 2. **CRUD Operations**
- **Create**: Add new users with a form
- **Read**: Display list of users from API
- **Update**: Edit existing users
- **Delete**: Remove users with confirmation

### 3. **Advanced Features**

#### Caching
- Automatic in-memory caching of API responses
- 5-minute cache duration for optimal performance
- Cache invalidation on mutations (create, update, delete)
- Force refresh option to bypass cache
- Cache status monitoring

```typescript
// Service automatically caches responses
getUsers(forceRefresh = false): Observable<User[]> {
  // Returns cached data if available and fresh
  // Otherwise fetches from API
}

// Check cache status
getCacheStatus(): { cached: boolean; age: number }
```

#### Optimistic Updates
- Immediate UI updates before API confirmation
- Automatic rollback on errors
- Better user experience with instant feedback

```typescript
// Example: Delete user optimistically
deleteUser(user: User): void {
  // 1. Update UI immediately
  this.users.update(users => users.filter(u => u.id !== user.id));
  
  // 2. Call API
  this.userService.deleteUser(user.id).subscribe({
    next: () => console.log('Success'),
    error: () => this.users.set(originalUsers) // Rollback
  });
}
```

### 4. **Best Practices**

#### Component Structure
- Separate files for TypeScript, HTML, and SCSS
- Component located in `src/app/components/users/`

#### Reactive State Management
- Signals for all reactive state
- Centralized state in the component
- Clean separation of concerns

#### Service Layer
- `UserService` encapsulates all API calls
- Uses modern `inject()` function
- Returns Observables for async operations
- Built-in caching with automatic invalidation
- Signal-based cache management

#### Data Models
- TypeScript interfaces for type safety
- Separate DTOs for Create and Update operations
- Located in `src/app/models/`

#### Styling
- Component-scoped SCSS
- Modern CSS Grid for responsive layouts
- Smooth animations and transitions
- Mobile-responsive design

### 5. **API Integration**

The demo uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) - a free fake REST API for testing:
- `GET /users` - Fetch all users (cached for 5 minutes)
- `GET /users/:id` - Fetch single user (uses cache if available)
- `POST /users` - Create user (invalidates cache)
- `PUT /users/:id` - Update user (invalidates cache)
- `DELETE /users/:id` - Delete user (invalidates cache)

**Note**: JSONPlaceholder is a mock API, so changes don't persist on the server. However, our caching and optimistic updates provide a realistic experience.

## Project Structure

```
src/app/
├── components/
│   └── users/
│       ├── users.component.ts       # Component logic with optimistic updates
│       ├── users.component.html     # Template
│       ├── users.component.scss     # Styles
│       └── users.component.spec.ts  # Component tests
├── models/
│   └── user.model.ts                # Data models and DTOs
├── services/
│   ├── user.service.ts              # API service with caching
│   └── user.service.spec.ts         # Service tests
├── app.config.ts                    # App configuration
├── app.routes.ts                    # Route definitions
├── app.ts                           # Root component
├── app.html                         # Root template
└── app.scss                         # Root styles
```

## Running the Demo

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Navigate to `http://localhost:4200/`

4. Build for production:
   ```bash
   npm run build
   ```

## Key Angular Features Used

### Signals
```typescript
protected readonly users = signal<User[]>([]);
protected readonly isLoading = signal(false);
```

### Modern Dependency Injection
```typescript
private readonly userService = inject(UserService);
```

### New Template Syntax
```html
@if (isLoading()) {
  <div class="loading">Loading...</div>
}

@for (user of users(); track user.id) {
  <div>{{ user.name }}</div>
}
```

### Standalone Components
```typescript
@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
```

## Performance Optimizations

### Caching Strategy
- **Initial Load**: Data fetched from API
- **Subsequent Loads**: Served from cache (5-minute TTL)
- **On Mutations**: Cache automatically invalidated
- **Manual Refresh**: Force cache bypass with refresh button

### Optimistic UI Updates
- **Create**: User appears instantly, confirmed by API
- **Update**: Changes visible immediately, synced with server
- **Delete**: User removed from UI, operation confirmed
- **Error Handling**: Automatic rollback on failure

This approach provides:
- ⚡ **Instant feedback** - No waiting for API responses
- 📉 **Reduced API calls** - Fewer network requests via caching
- 💪 **Better UX** - Responsive interface even with slow connections
- 🔄 **Reliability** - Automatic rollback on errors

## Testing

The project includes comprehensive tests:
- **18 test suites** covering all functionality
- **Component tests** for UI behavior
- **Service tests** for caching and API calls
- **Optimistic update tests** for data integrity

Run tests with:
```bash
npm test
```

## Learning Resources

- [Angular Documentation](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [New Control Flow](https://angular.dev/guide/templates/control-flow)
- [RxJS Operators](https://rxjs.dev/guide/operators)
