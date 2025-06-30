import { Dialog } from '@angular/cdk/dialog';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { DrawerComponent, Width } from './drawer.component';

export interface Tab {
  label: string;
  component: ComponentType<any>;
}

type Options = {
  width: Width;
  zaakId: string;
  title:string;
  tabs: Tab[];
  activeTab?: Tab['label'];
};

export type DrawerData = {
  portal: ComponentPortal<any>;
} & Options;

@Injectable({ providedIn: 'root' })
export class DrawerService {
  dialog = inject(Dialog);

  openDrawer(
    component: any,
    options: Options = { width: 'full', zaakId: '', tabs: [], activeTab: undefined, title: '' } // Default values
  ) {
    const portal = new ComponentPortal(component);

    this.dialog.open(DrawerComponent, {
      data: { portal, ...options },
    });
  }
}