# Kanban Board Demo

A production-grade Kanban board implementation using Angular v20+ showcasing modern Angular patterns, clean architecture, and excellent UX.

## Features

### Core Functionality
- ✅ Three configurable columns: To Do, In Progress, Done
- ✅ Drag & drop tasks between columns
- ✅ Reorder tasks within columns
- ✅ Create, update, and delete tasks
- ✅ Optimistic updates with automatic rollback on failure
- ✅ Real-time UI updates using Angular Signals

### Architecture Highlights
- **Standalone Components**: No NgModules, fully modern Angular
- **Signals-First State Management**: Reactive state without NgRx
- **Clean Architecture**: Separation of concerns with services, models, and components
- **TypeScript Strict Mode**: Full type safety
- **Feature-Based Structure**: Self-contained feature module

### State Management
The state is managed by `KanbanStateService` using Angular Signals:

```typescript
// Read-only signals for UI binding
readonly board: Signal<Board | null>
readonly loading: Signal<LoadingState>
readonly error: Signal<string | null>
readonly isLoading: Signal<boolean>
```

**Optimistic Updates**: Changes are applied immediately to the UI, then synchronized with the API. If the API call fails, the state automatically rolls back to the previous snapshot.

**Cache Strategy**: Implements stale-while-revalidate with a 5-minute cache duration. Fresh data is fetched only when:
- Forced refresh is requested
- Cache is older than 5 minutes
- No cached data exists

### API Integration
`KanbanApiService` provides a mock backend that:
- Attempts to fetch real data from JSONPlaceholder API
- Falls back to generated mock data if the API is unavailable
- Simulates realistic API delays (300ms)
- Maintains an in-memory data store for demo persistence

### Drag & Drop
Uses Angular CDK DragDrop with:
- Visual drag previews
- Drop zone indicators
- Smooth animations
- Connected drop lists for cross-column moves
- Automatic state persistence

### Error Handling
- Network failures display error banners
- Failed optimistic updates roll back automatically
- User-friendly error messages
- Dismissible error notifications

## Project Structure

```
features/kanban/
├── components/
│   ├── kanban-board.component.ts    # Main container
│   ├── kanban-column.component.ts   # Column with drop zone
│   └── task-card.component.ts       # Individual task card
├── models/
│   ├── board.model.ts              # Board and Column types
│   └── task.model.ts               # Task types and DTOs
├── services/
│   ├── kanban-api.service.ts       # API integration
│   ├── kanban-api.service.spec.ts  # API tests
│   ├── kanban-state.service.ts     # State management
│   └── kanban-state.service.spec.ts # State tests
└── README.md                        # This file
```

## Testing

Comprehensive unit test coverage (22 tests) including:
- State management logic
- API service interactions
- Optimistic update behavior
- Rollback on failure scenarios
- Cache invalidation

Run tests:
```bash
npm test -- --include='**/kanban/**/*.spec.ts'
```

## Usage

The Kanban board is accessible at the root route (`/kanban`) and is configured as the default route in the application.

### Key User Interactions

1. **Drag Tasks**: Click and drag any task card to move it
2. **Delete Tasks**: Click the × button on any task card
3. **Refresh Data**: Click the "Refresh" button to force reload
4. **Dismiss Errors**: Click × on error banners to dismiss them

## Technical Implementation Details

### Optimistic Updates with Rollback

```typescript
// 1. Take a deep snapshot of current state
this.takeSnapshot();

// 2. Apply change optimistically (immediate UI update)
this._state.update(state => applyChange(state));

// 3. Persist to API
this.apiService.update().pipe(
  catchError(error => {
    // 4. Rollback on failure
    this.rollbackSnapshot();
    return of(null);
  }),
  finalize(() => this.clearSnapshot())
).subscribe();
```

### Signal-Based Reactivity

Components automatically update when signals change:

```typescript
@Component({
  template: `
    @if (board()) {
      <!-- Render board -->
    }
  `
})
export class KanbanBoardComponent {
  readonly board = this.stateService.board;  // Signal
  readonly isLoading = this.stateService.isLoading;
}
```

## Dependencies

- `@angular/cdk`: Drag and drop functionality
- `@angular/common/http`: API communication
- RxJS: Reactive programming for API calls

## Future Enhancements (Optional)

- Keyboard-accessible drag-and-drop
- Undo/redo functionality
- Task filtering and search
- Real-time collaboration
- Custom column configuration
- Task priorities and labels
- Due dates and reminders
