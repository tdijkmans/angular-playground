# Apollo Client POC

This is a proof of concept (POC) implementation of Apollo Client in an Angular application, showcasing different techniques for working with GraphQL APIs.

## Overview

This POC demonstrates how to integrate Apollo Client with Angular and showcases various techniques for querying GraphQL APIs, managing cache, and handling data.

## Features Implemented

### 1. Apollo Client Setup
- **Dependencies**: Installed `@apollo/client`, `graphql`, and `apollo-angular`
- **Configuration**: Configured Apollo Client in `app.config.ts` with:
  - HttpLink for making GraphQL requests
  - InMemoryCache for client-side caching
  - Connection to SpaceX GraphQL API

### 2. Dedicated Apollo Service (`apollo.service.ts`)

The service demonstrates 4 key techniques:

#### Technique 1: Simple Query using `watchQuery`
```typescript
getLaunches(limit: number = 10): Observable<Launch[]>
```
- Uses `watchQuery` to create an observable that watches for changes
- Automatically updates when the cache changes
- Best for real-time data that may update

#### Technique 2: One-time Query using `query`
```typescript
getLaunchById(id: string): Observable<Launch>
```
- Uses `query` method for single-fetch operations
- Returns a single result without watching for updates
- Best for fetching specific data that doesn't need real-time updates

#### Technique 3: Custom Fetch Policies
```typescript
getLaunchesWithCachePolicy(
  limit: number = 10, 
  fetchPolicy: 'cache-first' | 'network-only' | 'cache-and-network'
): Observable<Launch[]>
```
- Demonstrates different cache strategies:
  - `cache-first`: Check cache first, then network if not found
  - `network-only`: Always fetch from network, ignore cache
  - `cache-and-network`: Return cached data immediately, then update from network

#### Technique 4: Cache Management
```typescript
clearCache(): Promise<any[]>
```
- Demonstrates how to manually clear the Apollo cache
- Useful for forcing fresh data fetches or handling logout scenarios

### 3. Interactive Demo Component (`apollo-demo`)

The demo component showcases:
- Loading SpaceX launch data using different techniques
- Interactive buttons to test different cache policies
- Visual feedback for loading and error states
- Detailed launch information display
- Cache clearing functionality

### 4. Type Safety

All GraphQL queries and responses use TypeScript interfaces:
```typescript
interface Launch {
  id: string;
  mission_name: string;
  launch_date_local: string;
  launch_success: boolean | null;
  rocket: {
    rocket_name: string;
  };
}
```

## Project Structure

```
src/app/
├── services/
│   ├── apollo.service.ts          # Main Apollo service with query methods
│   └── apollo.service.spec.ts     # Unit tests for Apollo service
├── apollo-demo/
│   ├── apollo-demo.component.ts   # Demo component showcasing techniques
│   ├── apollo-demo.html           # Template with interactive UI
│   ├── apollo-demo.scss           # Styling
│   └── apollo-demo.spec.ts        # Unit tests
└── app.config.ts                  # Apollo Client configuration
```

## API Used

- **Public API**: SpaceX GraphQL API
- **Endpoint**: `https://api.spacex.land/graphql/`
- **Data**: Historical SpaceX launch information

## How to Use

### Running the Demo

1. Navigate to the Apollo Client POC section in the app
2. Click "Refresh" to fetch launches using `watchQuery`
3. Click on any launch card to fetch detailed information using one-time `query`
4. Try different cache policies to see how Apollo handles caching
5. Use "Clear Cache" to reset the cache and force fresh fetches

### Integrating into Your Project

1. **Install dependencies**:
   ```bash
   npm install @apollo/client graphql apollo-angular
   ```

2. **Configure Apollo** in `app.config.ts`:
   ```typescript
   import { provideApollo } from 'apollo-angular';
   import { HttpLink } from 'apollo-angular/http';
   import { InMemoryCache } from '@apollo/client/core';

   export const appConfig: ApplicationConfig = {
     providers: [
       provideHttpClient(),
       provideApollo(() => {
         const httpLink = inject(HttpLink);
         return {
           link: httpLink.create({ uri: 'YOUR_GRAPHQL_ENDPOINT' }),
           cache: new InMemoryCache(),
         };
       }),
     ]
   };
   ```

3. **Create a service** similar to `apollo.service.ts` for your GraphQL queries

4. **Use in components** by injecting the service and subscribing to observables

## Techniques Demonstrated

1. ✅ **Query Patterns**: Both `watchQuery` for real-time updates and `query` for one-time fetches
2. ✅ **Cache Strategies**: Different fetch policies (cache-first, network-only, cache-and-network)
3. ✅ **Error Handling**: Proper error states and user feedback
4. ✅ **Loading States**: Visual indicators for async operations
5. ✅ **Type Safety**: Full TypeScript support with interfaces
6. ✅ **Cache Management**: Manual cache clearing and refresh capabilities

## Testing

All components and services include unit tests:
- `apollo.service.spec.ts` - Tests for the Apollo service
- `apollo-demo.spec.ts` - Tests for the demo component

Run tests with:
```bash
npm test
```

## Screenshots

![Apollo Client POC Demo](https://github.com/user-attachments/assets/eb319ed7-7953-4c2f-9857-a1c900eba675)

The UI demonstrates:
- Navigation between demos
- Interactive cache policy selection
- Clear visual feedback for different states
- Comprehensive technique documentation

## Notes

- The implementation uses Angular's standalone components and modern DI patterns
- All Apollo setup follows best practices from the official Apollo Angular documentation
- The service is designed to be easily extendable for additional queries and mutations
- Cache policies can be adjusted per query based on use case requirements

## Next Steps

To extend this POC:
1. Add mutation examples (create/update/delete operations)
2. Implement GraphQL subscriptions for real-time updates
3. Add optimistic UI updates
4. Implement pagination for large datasets
5. Add Apollo DevTools integration for debugging
