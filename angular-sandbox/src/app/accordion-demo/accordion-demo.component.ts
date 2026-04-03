import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AccordionComponent } from '../accordion/accordion.component';

interface AccordionItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  locked: boolean;
}

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [CommonModule, AccordionComponent, DragDropModule],
  templateUrl: './accordion-demo.component.html',
  styleUrl: './accordion-demo.component.scss',
})
export class AccordionDemoComponent {
  items = signal<AccordionItem[]>([
    { id: 1, title: 'Introduction', subtitle: 'Getting started', content: 'Welcome to the accordion component demo. This is the introduction section.', locked: false },
    { id: 2, title: 'Installation', subtitle: 'Setup & configuration', content: 'To install, run: npm install @angular/cdk. Configure in your app.config.ts.', locked: false },
    { id: 3, title: 'Basic Usage', subtitle: 'Simple examples', content: 'Use <app-accordion title="Hello"> with body content inside the tags.', locked: false },
    { id: 4, title: 'Advanced API', subtitle: 'Inputs & outputs', content: 'The accordion supports title, subtitle, open, and disabled inputs.', locked: true },
    { id: 5, title: 'Theming', subtitle: 'CSS custom properties', content: 'Override --acc-radius, --acc-bg, --acc-border, --acc-header-bg for custom themes.', locked: false },
    { id: 6, title: 'Accessibility', subtitle: 'A11y best practices', content: 'All interactive elements have :focus-visible styles and follow ARIA guidelines.', locked: false },
    { id: 7, title: 'Changelog', subtitle: 'Version history', content: 'v1.0.0 - Initial release with full compound component support and CDK drag-drop.', locked: true },
  ]);

  toggleLock(item: AccordionItem, event: MouseEvent): void {
    event.stopPropagation();
    this.items.update(list =>
      list.map(i => i.id === item.id ? { ...i, locked: !i.locked } : i)
    );
  }

  drop(event: CdkDragDrop<AccordionItem[]>): void {
    this.items.update(list => {
      const arr = [...list];
      moveItemInArray(arr, event.previousIndex, event.currentIndex);
      return arr;
    });
  }
}
