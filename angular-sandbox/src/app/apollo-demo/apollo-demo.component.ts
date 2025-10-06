import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApolloService, Launch } from '../services/apollo.service';

@Component({
  selector: 'app-apollo-demo',
  imports: [CommonModule],
  templateUrl: './apollo-demo.html',
  styleUrl: './apollo-demo.scss'
})
export class ApolloDemo implements OnInit {
  launches = signal<Launch[]>([]);
  selectedLaunch = signal<Launch | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  cachePolicy = signal<'cache-first' | 'network-only' | 'cache-and-network'>('cache-first');

  constructor(private apolloService: ApolloService) {}

  ngOnInit(): void {
    this.loadLaunches();
  }

  /**
   * Technique 1: Load launches using watchQuery
   */
  loadLaunches(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.apolloService.getLaunches(5).subscribe({
      next: (data) => {
        this.launches.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load launches: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Technique 2: Load a single launch by ID
   */
  loadLaunchById(id: string): void {
    this.apolloService.getLaunchById(id).subscribe({
      next: (data) => {
        this.selectedLaunch.set(data);
      },
      error: (err) => {
        this.error.set('Failed to load launch: ' + err.message);
      }
    });
  }

  /**
   * Technique 3: Load with different cache policy
   */
  loadWithCachePolicy(policy: 'cache-first' | 'network-only' | 'cache-and-network'): void {
    this.cachePolicy.set(policy);
    this.loading.set(true);
    this.error.set(null);

    this.apolloService.getLaunchesWithCachePolicy(5, policy).subscribe({
      next: (data) => {
        this.launches.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load launches: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Clear Apollo cache
   */
  clearCache(): void {
    this.apolloService.clearCache().then(() => {
      console.log('Cache cleared successfully');
      this.loadLaunches();
    });
  }

  /**
   * Refresh data
   */
  refresh(): void {
    this.loadLaunches();
  }
}
