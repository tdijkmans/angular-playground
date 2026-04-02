import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';

export type DrawerState = 'closed' | 'half' | 'full';

export const ITEMS = [
  { id: 1, label: 'Alpha' },
  { id: 2, label: 'Beta' },
  { id: 3, label: 'Gamma' },
  { id: 4, label: 'Delta' },
  { id: 5, label: 'Epsilon' },
  { id: 6, label: 'Zeta' },
] as const;

const BREAKPOINT = 768;

@Component({
  selector: 'app-drawer-grid',
  standalone: true,
  imports: [],
  templateUrl: './drawer-grid.html',
  styleUrl: './drawer-grid.scss',
})
export class DrawerGrid implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subs = new Subscription();
  private resize$ = new Subject<void>();

  drawerState: DrawerState = 'half';
  activeItem: number | null = null;
  activeLabelText = 'None';

  readonly items = [...ITEMS];

  get visibleItems() {
    return this.drawerState === 'full' ? this.items : this.items.slice(0, 3);
  }

  ngOnInit(): void {
    this.subs.add(
      this.route.queryParamMap.subscribe((params) => {
        const raw = params.get('item');
        const parsed = raw ? parseInt(raw, 10) : NaN;
        this.activeItem = !isNaN(parsed) ? parsed : null;
        this.activeLabelText =
          this.items.find((i) => i.id === this.activeItem)?.label ?? 'None';
      }),
    );

    this.subs.add(
      this.resize$
        .pipe(debounceTime(150))
        .subscribe(() => this.checkWindowSize()),
    );

    this.checkWindowSize();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resize$.next();
  }

  private checkWindowSize(): void {
    if (window.innerWidth < BREAKPOINT && this.drawerState === 'full') {
      this.applyDrawerState('half');
    }
  }

  /** Toggle between half ↔ full (only when drawer is open). */
  toggleSize(): void {
    if (this.drawerState === 'half') {
      this.applyDrawerState('full');
    } else if (this.drawerState === 'full') {
      this.applyDrawerState('half');
    }
  }

  openDrawer(): void {
    this.applyDrawerState('half');
  }

  closeDrawer(): void {
    this.applyDrawerState('closed');
  }

  private applyDrawerState(next: DrawerState): void {
    this.drawerState = next;
    if (next === 'half') {
      this.ensureActiveItemVisible();
    }
  }

  /**
   * When collapsing to half mode, items 4-6 disappear.
   * Map the active item to its visible counterpart (4→1, 5→2, 6→3).
   */
  private ensureActiveItemVisible(): void {
    if (this.activeItem !== null && this.activeItem > 3) {
      this.selectItem(this.activeItem - 3);
    }
  }

  selectItem(id: number): void {
    this.activeItem = id;
    this.activeLabelText = this.items.find((i) => i.id === id)?.label ?? 'None';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { item: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  isActive(id: number): boolean {
    return this.activeItem === id;
  }
}
