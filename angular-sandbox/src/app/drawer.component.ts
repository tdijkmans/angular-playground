import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-drawer-container',
    imports: [CommonModule, CdkPortalOutlet],
    template: `
    <div class="drawer" [ngStyle]="{ width: drawerWidth }">
      <div class="top-bar">
        <button (click)="setWidth('full')">Full</button>
        <button (click)="setWidth('half')">Half</button>
        <button (click)="setWidth('wide')">Wide</button>
        <button (click)="cloneTab()">Clone Tab</button>
        <button (click)="close()">Close</button>
      </div>
      <ng-template [cdkPortalOutlet]="content"></ng-template>
    </div>
  `,
    styles: [
        `.drawer { height: 100vh; transition: width 0.3s; background: #fff; position: fixed; right: 0; top: 0; }`,
        `.top-bar { display: flex; gap: 8px; padding: 8px; background: #eee; }`
    ]
})
export class DrawerContainerComponent {
    drawerWidth = '100%';
    private dialogRef = inject(DialogRef);
    private data = inject(DIALOG_DATA) as { portal: ComponentPortal<any>, width: string };
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    content = this.data.portal;

    constructor() {
        this.setWidth(this.data.width || 'full');
        this.route.queryParams.subscribe(params => {
            if (params['drawerWidth']) this.setWidth(params['drawerWidth']);
        });
    }

    setWidth(mode: string) {
        let width;
        switch (mode) {
            case 'half': width = '50%'; break;
            case 'wide': width = 'calc(100% - 60px)'; break;
            default: width = '100%';
        }
        this.drawerWidth = width;
        this.router.navigate([], { queryParams: { drawerWidth: mode }, queryParamsHandling: 'merge' });
    }

    close() { this.dialogRef.close(); }

    cloneTab() {
        window.open(window.location.href, '_blank');
    }
}