import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DrawerService } from './drawer.service';
import { MyContentComponent } from './my-content.component';

@Component({
  selector: 'zaak-profiel',
  imports: [RouterOutlet],
  template: `
    <div>zaak-profiel</div>
    <button (click)="openMyDrawer()">Open Drawer</button>
    <router-outlet></router-outlet>`
})
export class ZaakProfiel {
  protected title = 'angular-sandbox';
  private drawer = inject(DrawerService);
  private route = inject(ActivatedRoute);
  private drawerOpen = false;
  private zaakId = this.route.snapshot.paramMap.get('zaakid') || '';

  constructor() {
    // Subscribe to query parameters to handle drawer opening
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const width = params['drawerWidth'] || 'full';
        // Open drawer if drawerWidth or id is present and not already open
        if ((params['drawerWidth']) && !this.drawerOpen) {
          this.drawer.openDrawer(MyContentComponent, width, this.zaakId);
          this.drawerOpen = true;
        }
      });
    // If the route has a zaakId, open the drawer immediately
    if (this.zaakId && !this.drawerOpen) {
      this.drawer.openDrawer(MyContentComponent, 'half', this.zaakId);
      this.drawerOpen = true;
    }
  }

  openMyDrawer() {
    this.drawer.openDrawer(MyContentComponent, 'half', this.zaakId);
    this.drawerOpen = true;
  }

}
