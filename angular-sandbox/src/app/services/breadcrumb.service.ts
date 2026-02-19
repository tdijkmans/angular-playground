import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Breadcrumb {
  label: string;
  url: string;
}

const BREADCRUMB_KEY = 'breadcrumb';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  private readonly breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        switchMap(() => this.buildBreadcrumbs(this.router.routerState.snapshot.root)),
      )
      .subscribe(crumbs => this.breadcrumbsSubject.next(crumbs));
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot,
    parentUrl = '',
  ): Observable<Breadcrumb[]> {
    const segments = route.url.map(s => s.path).filter(Boolean);
    const currentUrl = segments.length > 0 ? `${parentUrl}/${segments.join('/')}` : parentUrl;

    let current$: Observable<Breadcrumb[]> = of([]);

    if (route.data[BREADCRUMB_KEY] !== undefined && currentUrl) {
      const crumbData = route.data[BREADCRUMB_KEY];
      if (crumbData !== null) {
        current$ = of([{ label: crumbData as string, url: currentUrl }]);
      } else {
        const paramName: string = route.data['breadcrumbParam'] ?? 'id';
        const resource: string = route.data['breadcrumbResource'] ?? 'product';
        const id: string | undefined = route.params[paramName];
        if (id) {
          current$ = this.apiService.getLabel(resource, id).pipe(
            map(name => [{ label: name, url: currentUrl }]),
          );
        }
      }
    }

    const primaryChild =
      route.children.find(c => c.outlet === 'primary') ?? route.children[0];

    if (!primaryChild) {
      return current$;
    }

    return forkJoin([current$, this.buildBreadcrumbs(primaryChild, currentUrl)]).pipe(
      map(([curr, child]) => [...curr, ...child]),
    );
  }
}
