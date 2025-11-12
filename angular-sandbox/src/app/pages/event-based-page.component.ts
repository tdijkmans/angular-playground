import { Component } from '@angular/core';
import { EditableSubjectComponent } from '../editable-subject/editable-subject.component';

@Component({
  selector: 'app-event-based-page',
  standalone: true,
  imports: [EditableSubjectComponent],
  template: `
    <div class="page-container">
      <h1>EditableSubjectComponent - Event-Based Version</h1>
      <p class="description">
        This version uses EventEmitters for output and does not integrate with Angular forms.
        It's useful for simple use cases where you don't need form validation or reactive form features.
      </p>
      
      <div class="demo-section">
        <h3>Example 1: Without PATCH URL</h3>
        <app-editable-subject
          [subject]="'Click Edit to modify this subject'"
          (subjectSaved)="onSubjectSaved($event)"
          (subjectReset)="onSubjectReset()"
        />
        
        <h3>Example 2: With PATCH URL (will fail - no server)</h3>
        <app-editable-subject
          [subject]="'This example includes a patchUrl'"
          [patchUrl]="'https://jsonplaceholder.typicode.com/posts/1'"
          [patchKey]="'title'"
          (subjectSaved)="onSubjectSaved($event)"
          (subjectReset)="onSubjectReset()"
        />
        
        <h3>Example 3: Empty initial value</h3>
        <app-editable-subject
          (subjectSaved)="onSubjectSaved($event)"
          (subjectReset)="onSubjectReset()"
        />
      </div>
      
      <div class="event-log">
        <h3>Event Log:</h3>
        <div class="log-content">
          @for (log of eventLogs; track $index) {
            <div class="log-entry">{{ log }}</div>
          }
          @empty {
            <div class="log-empty">No events yet...</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .description {
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .demo-section {
      margin-bottom: 2rem;

      h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        color: #555;
      }

      app-editable-subject {
        display: block;
        margin-bottom: 2rem;
      }
    }

    .event-log {
      margin-top: 3rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;

      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #333;
      }

      .log-content {
        max-height: 300px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 0.875rem;
      }

      .log-entry {
        padding: 0.5rem;
        margin-bottom: 0.25rem;
        background-color: white;
        border-left: 3px solid #007bff;
        border-radius: 2px;
      }

      .log-empty {
        color: #999;
        font-style: italic;
        padding: 1rem;
        text-align: center;
      }
    }
  `]
})
export class EventBasedPageComponent {
  eventLogs: string[] = [];

  onSubjectSaved(value: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLogs.unshift(`[${timestamp}] Subject saved: "${value}"`);
    console.log('Subject saved:', value);
  }

  onSubjectReset() {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLogs.unshift(`[${timestamp}] Subject reset`);
    console.log('Subject reset');
  }
}
