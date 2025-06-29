import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DrawerService } from '../drawer/drawer.service';
import { MyContentComponent } from '../tabs/my-content.component';
import { MyOtherContentComponent } from '../tabs/my-other-content.component';

// Tab config defined only here for reusability
const TABS = [
  { label: 'MyContentComponentLabel', component: MyContentComponent },
  { label: 'MyOtherContentComponentLabel', component: MyOtherContentComponent },
];

@Component({
  selector: 'zaak-profiel',
  imports: [RouterOutlet],
  template: `
    <div>zaak-profiel</div>
    <button (click)="openMyDrawer()">Open Drawer</button>
    <button (click)="openTab('MyContentComponentLabel')">Open MyContentComponentLabel</button>
    <button (click)="openTab('MyOtherContentComponentLabel')">Open MyOtherContentComponentLabel</button>
    <router-outlet></router-outlet>`
})
export class ZaakProfiel {
  private drawer = inject(DrawerService);
  private route = inject(ActivatedRoute);
  private drawerOpen = false;
  private zaakId = this.route.snapshot.paramMap.get('zaakid') || '';

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const width = params['drawerWidth'] || 'full';
        const tab = params['tab'];
        const tabConfig = TABS.find(t => t.label === tab);
        // Open drawer if drawerWidth or id is present and not already open
        if (tabConfig && !this.drawerOpen) {
          this.drawer.openDrawer(tabConfig.component, width, this.zaakId, TABS, tab);
          this.drawerOpen = true;
        }
      });
    // If the route has a zaakId, open the drawer immediately
    if (this.zaakId && !this.drawerOpen) {
      this.drawer.openDrawer(MyContentComponent, 'half', this.zaakId, TABS, 'MyContentComponentLabel');
      this.drawerOpen = true;
    }
  }

  openMyDrawer() {
    this.drawer.openDrawer(MyContentComponent, 'half', this.zaakId, TABS, 'MyContentComponentLabel');
    this.drawerOpen = true;
  }

  openTab(tabLabel: string) {
    const tabConfig = TABS.find(t => t.label === tabLabel);
    if (tabConfig) {
      this.drawer.openDrawer(tabConfig.component, 'half', this.zaakId, TABS, tabLabel);
      this.drawerOpen = true;
    }
  }

}
