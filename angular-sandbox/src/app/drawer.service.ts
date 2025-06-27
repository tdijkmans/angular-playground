import { Dialog } from '@angular/cdk/dialog';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { DrawerContainerComponent } from './drawer.component';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  dialog = inject(Dialog);

  openDrawer(component: any, width: string = 'full') {
    const portal = new ComponentPortal(component);
    this.dialog.open(DrawerContainerComponent, {
      data: { portal, width },
      // Optionally add panelClass for custom styling
    });
  }
}