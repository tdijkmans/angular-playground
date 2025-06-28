import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class ZaakProfiel implements OnDestroy {
  protected title = 'angular-sandbox';
  private drawer = inject(DrawerService);
  private route = inject(ActivatedRoute);
  private sub: Subscription;
  private drawerOpen = false;
  private zaakId = this.route.snapshot.paramMap.get('zaakid') || '';

  constructor() {
    // Subscribe to query parameters to handle drawer opening
    this.sub = this.route.queryParams.subscribe(params => {
      const width = params['drawerWidth'] || 'full';
      // Open drawer if drawerWidth or id is present and not already open
      if ((params['drawerWidth']) && !this.drawerOpen) {
        this.drawer.openDrawer(MyContentComponent, width, this.zaakId);
        this.drawerOpen = true;
      }
    });
  }

  openMyDrawer() {
    this.drawer.openDrawer(MyContentComponent, 'half', this.zaakId);
    this.drawerOpen = true;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
