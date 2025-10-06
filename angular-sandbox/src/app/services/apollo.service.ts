import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Launch {
  id: string;
  mission_name: string;
  launch_date_local: string;
  launch_success: boolean | null;
  rocket: {
    rocket_name: string;
  };
}

export interface LaunchesResponse {
  launchesPast: Launch[];
}

export interface LaunchResponse {
  launch: Launch;
}

@Injectable({
  providedIn: 'root'
})
export class ApolloService {
  constructor(private apollo: Apollo) {}

  /**
   * Technique 1: Simple query using watchQuery
   * Returns an observable that watches for changes
   */
  getLaunches(limit: number = 10): Observable<Launch[]> {
    const GET_LAUNCHES = gql`
      query GetLaunches($limit: Int!) {
        launchesPast(limit: $limit) {
          id
          mission_name
          launch_date_local
          launch_success
          rocket {
            rocket_name
          }
        }
      }
    `;

    return this.apollo
      .watchQuery<LaunchesResponse>({
        query: GET_LAUNCHES,
        variables: { limit }
      })
      .valueChanges.pipe(
        map(result => result.data.launchesPast)
      );
  }

  /**
   * Technique 2: One-time query using query method
   * Returns a single result without watching for updates
   */
  getLaunchById(id: string): Observable<Launch> {
    const GET_LAUNCH = gql`
      query GetLaunch($id: ID!) {
        launch(id: $id) {
          id
          mission_name
          launch_date_local
          launch_success
          rocket {
            rocket_name
          }
        }
      }
    `;

    return this.apollo
      .query<LaunchResponse>({
        query: GET_LAUNCH,
        variables: { id }
      })
      .pipe(
        map(result => result.data.launch)
      );
  }

  /**
   * Technique 3: Query with custom fetch policy
   * Demonstrates cache management options
   */
  getLaunchesWithCachePolicy(limit: number = 10, fetchPolicy: 'cache-first' | 'network-only' | 'cache-and-network' = 'cache-first'): Observable<Launch[]> {
    const GET_LAUNCHES = gql`
      query GetLaunches($limit: Int!) {
        launchesPast(limit: $limit) {
          id
          mission_name
          launch_date_local
          launch_success
          rocket {
            rocket_name
          }
        }
      }
    `;

    return this.apollo
      .watchQuery<LaunchesResponse>({
        query: GET_LAUNCHES,
        variables: { limit },
        fetchPolicy: fetchPolicy
      })
      .valueChanges.pipe(
        map(result => result.data.launchesPast)
      );
  }

  /**
   * Technique 4: Mutation example
   * Note: This is a placeholder as SpaceX API doesn't support mutations
   * In a real app, this would insert/update data
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createLaunch(missionName: string): Observable<any> {
    // Example mutation structure (won't work with SpaceX API)
    const CREATE_LAUNCH = gql`
      mutation CreateLaunch($missionName: String!) {
        insert_launch(mission_name: $missionName) {
          id
          mission_name
        }
      }
    `;

    // This is just for demonstration
    return this.apollo
      .mutate({
        mutation: CREATE_LAUNCH,
        variables: { missionName }
      })
      .pipe(
        map(result => result.data)
      );
  }

  /**
   * Clear Apollo cache
   * Useful for forcing fresh data fetches
   */
  clearCache(): Promise<any[]> {
    return this.apollo.client.clearStore();
  }
}
