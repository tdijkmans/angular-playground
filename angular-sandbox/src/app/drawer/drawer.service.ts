import { Dialog } from '@angular/cdk/dialog';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { DrawerComponent, Width } from './drawer.component';

export interface Tab {
  label: string;
  component: ComponentType<any>;
} 


@Injectable({ providedIn: 'root' })
export class DrawerService {
  dialog = inject(Dialog);

  openDrawer(component: any, width: Width = 'full', zaakId: string, tabs?: Tab[], activeTab?: Tab['label']) {
    const portal = new ComponentPortal(component);

    this.dialog.open(DrawerComponent, {
      data: { portal, width, zaakId, tabs, activeTab },
    });
  }
}