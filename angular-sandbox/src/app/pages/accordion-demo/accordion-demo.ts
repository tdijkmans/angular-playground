import {
    CdkDrag,
    CdkDragDrop,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDropList,
} from '@angular/cdk/drag-drop';
import { Component, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
    AccordionDetailsDirective,
    AccordionLeftDirective,
    AccordionMarkerDirective,
    AccordionRightDirective,
    AccordionSummaryDirective,
} from '../../components/wrapper-accordion/accordion-compound.directives';
import { WrapperAccordionComponent } from '../../components/wrapper-accordion/wrapper-accordion';

interface AccordionItem {
  id: number;
  title: string;
  locked: boolean;
  details: string;
  estimate: number;
}

const DEMO_ITEMS: AccordionItem[] = [
  { id: 1, title: 'Kickoff and Scope', locked: false, details: 'Align goals and shape delivery milestones.', estimate: 2 },
  { id: 2, title: 'Discovery Research', locked: false, details: 'Collect stakeholder notes and map constraints.', estimate: 3 },
  { id: 3, title: 'Architecture Notes', locked: true, details: 'Capture API boundaries and service ownership.', estimate: 5 },
  { id: 4, title: 'Wireframe Pass', locked: false, details: 'Draft responsive flows for desktop and mobile.', estimate: 3 },
  { id: 5, title: 'Interaction Specs', locked: false, details: 'Describe hover, focus, and motion behaviors.', estimate: 2 },
  { id: 6, title: 'QA Checklist', locked: true, details: 'Track accessibility and regression checks.', estimate: 1 },
  { id: 7, title: 'Release Prep', locked: false, details: 'Finalize release notes and rollout timeline.', estimate: 2 },
];

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [
    WrapperAccordionComponent,
    AccordionDetailsDirective,
    AccordionLeftDirective,
    AccordionSummaryDirective,
    AccordionMarkerDirective,
    AccordionRightDirective,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    FormsModule,
  ],
  templateUrl: './accordion-demo.html',
  styleUrl: './accordion-demo.scss',
})
export class AccordionDemoComponent {
  protected readonly items: WritableSignal<AccordionItem[]> = signal(DEMO_ITEMS);

  protected drop(event: CdkDragDrop<AccordionItem[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    this.items.update(current => {
      const next = [...current];
      const [moved] = next.splice(event.previousIndex, 1);
      next.splice(event.currentIndex, 0, moved);
      return next;
    });
  }

  protected toggleLock(itemId: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.items.update(current =>
      current.map(item =>
        item.id === itemId
          ? {
              ...item,
              locked: !item.locked,
            }
          : item,
      ),
    );
  }

  protected trackById(_: number, item: AccordionItem): number {
    return item.id;
  }
}
