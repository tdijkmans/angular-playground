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

### 3. **Best Practices**

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

#### Data Models
- TypeScript interfaces for type safety
- Separate DTOs for Create and Update operations
- Located in `src/app/models/`

#### Styling
- Component-scoped SCSS
- Modern CSS Grid for responsive layouts
- Smooth animations and transitions
- Mobile-responsive design

### 4. **API Integration**

The demo uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) - a free fake REST API for testing:
- `GET /users` - Fetch all users
- `GET /users/:id` - Fetch single user
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Note**: JSONPlaceholder is a mock API, so changes don't persist on the server.

## Project Structure

```
src/app/
├── components/
│   └── users/
│       ├── users.component.ts       # Component logic
│       ├── users.component.html     # Template
│       └── users.component.scss     # Styles
├── models/
│   └── user.model.ts                # Data models and DTOs
├── services/
│   └── user.service.ts              # API service
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

## Learning Resources

- [Angular Documentation](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [New Control Flow](https://angular.dev/guide/templates/control-flow)
