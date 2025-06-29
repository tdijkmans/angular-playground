import { Dialog } from '@angular/cdk/dialog';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { DrawerComponent } from './drawer.component';


export type Width = 'full' | 'half' | 'wide';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  dialog = inject(Dialog);

  openDrawer(component: any, width: Width = 'full', zaakId: string, tabs?: any[], activeTab?: string) {
    console.log(`Opening drawer with component: ${component.name}, width: ${width}, zaakId: ${zaakId}`);
    const portal = new ComponentPortal(component);


    this.dialog.open(DrawerComponent, {
      data: { portal, width, zaakId, tabs, activeTab },
    });
  }
}