import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Width } from './drawer.service';

@Component({
    selector: 'app-drawer-container',
    imports: [CommonModule, CdkPortalOutlet],
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent {
    drawerWidth = '100%';
    private dialogRef = inject(DialogRef);
    public data = inject(DIALOG_DATA) as { portal: ComponentPortal<any>, width: Width, zaakId: string, tabs?: any[], activeTab?: string };
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    content = this.data.portal;
    activeTab = this.data.activeTab;

    constructor() {
        this.setWidth(this.data.width || 'full');
        this.route.queryParams.subscribe(params => {
            if (params['drawerWidth']) this.setWidth(params['drawerWidth']);
            if (params['tab'] && this.data.tabs) {
                this.setTab(params['tab']);
            }
        });
    }

    setWidth(mode: Width) {
        let width;
        switch (mode) {
            case 'half': width = '50%'; break;
            case 'wide': width = 'calc(100% - 60px)'; break;
            default: width = '100%';
        }
        this.drawerWidth = width;
        this.router.navigate([], { queryParams: { drawerWidth: mode }, queryParamsHandling: 'merge' });
    }

    setTab(tabLabel: string) {
        this.activeTab = tabLabel;
        if (this.data.tabs) {
            const tabConfig = this.data.tabs.find((t: any) => t.label === tabLabel);
            if (tabConfig) {
                this.content = new ComponentPortal(tabConfig.component);
            }
        }
    }

    selectTab(tabLabel: string) {
        this.router.navigate([], { queryParams: { tab: tabLabel }, queryParamsHandling: 'merge' });
        this.setTab(tabLabel);
    }

    closeDrawer() {
        this.router.navigate([], {
            queryParams: { drawerWidth: null, tab: null },
            queryParamsHandling: 'merge',
        });
        this.dialogRef.close();
    }

    cloneTab() {
        window.open(window.location.href, '_blank');
    }
}