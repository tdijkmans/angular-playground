import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DrawerService, Tab } from '../drawer/drawer.service';
import { MyContentComponent } from '../tabs/my-content.component';
import { MyOtherContentComponent } from '../tabs/my-other-content.component';


const TABS:  Tab[] = [
  { label: 'MyContentTab', component: MyContentComponent },
  { label: 'MyOtherContentTab', component: MyOtherContentComponent },
] as const;

@Component({
  selector: 'zaak-profiel',
  imports: [RouterOutlet],
  template: `
    <div>zaak-profiel</div>
    <button (click)="openMyDrawer()">Open Drawer</button>
    @if (TABS.length > 0) {
      <div class="tabs">
        @for (tab of TABS; track tab.label) {
          <button (click)="openTab(tab.label)">{{ tab.label }}</button>
        }
      </div>
    }
    <router-outlet></router-outlet>`
})
export class ZaakProfiel {
  private drawer = inject(DrawerService);
  private route = inject(ActivatedRoute);
  private drawerOpen = false;
  private zaakId = this.route.snapshot.paramMap.get('zaakid') || '';
  public TABS = TABS;

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const width = params['drawerWidth'] || 'full';
        const tab = params['tab'];
        const tabConfig = TABS.find((t) => t.label === tab);
        // Open drawer if drawerWidth or id is present and not already open
        if (tabConfig && !this.drawerOpen) {
          const options ={ width, zaakId: this.zaakId, tabs: TABS, activeTab: tab, title:'Titel X' }
          this.drawer.openDrawer(tabConfig.component,options );
          this.drawerOpen = true;
        }
      });
    
    // If the route has a zaakId, open the drawer immediately
    if (this.zaakId && !this.drawerOpen) {
      this.drawer.openDrawer(MyContentComponent, { width: 'half', zaakId: this.zaakId, tabs: TABS, activeTab: TABS[0].label , title:'Titel X' });
      this.drawerOpen = true;
    }
  }

  openMyDrawer() {
    this.drawer.openDrawer(MyContentComponent, { width: 'half', zaakId: this.zaakId, tabs: TABS, activeTab: TABS[0].label, title:'Titel X'  });
    this.drawerOpen = true;
  }

  openTab(tabLabel: Tab['label']) {
    const tabConfig = TABS.find((t) => t.label === tabLabel);
  
    if (tabConfig) {
      this.drawer.openDrawer(tabConfig.component, { width: 'half', zaakId: this.zaakId, tabs: TABS, activeTab: tabLabel, title:'Titel X'  });
      this.drawerOpen = true;
    }
  }

}
