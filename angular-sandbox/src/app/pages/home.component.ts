import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-container">
      <h1>Editable Subject Component Demos</h1>
      <p class="intro">
        This application demonstrates two different approaches to building an editable subject component in Angular 19:
      </p>

      <div class="demo-cards">
        <div class="card">
          <h2>Event-Based Version</h2>
          <p>
            Uses EventEmitters for output communication. This approach is simpler and suitable when you 
            don't need form validation or integration with Angular's reactive forms system.
          </p>
          <ul>
            <li>Signal-based inputs using <code>input()</code></li>
            <li>EventEmitter outputs</li>
            <li>Manual PATCH request handling</li>
            <li>Computed signals for derived state</li>
          </ul>
          <a routerLink="/event-based" class="btn btn-primary">View Event-Based Demo</a>
        </div>

        <div class="card">
          <h2>Form-Integrated Version</h2>
          <p>
            Implements ControlValueAccessor for seamless integration with Angular Reactive Forms. 
            Perfect for complex forms requiring validation, disabled states, and form-level control.
          </p>
          <ul>
            <li>ControlValueAccessor implementation</li>
            <li>Full reactive forms support</li>
            <li>Form validation integration</li>
            <li>Signal-based internal state</li>
          </ul>
          <a routerLink="/form-based" class="btn btn-success">View Form-Based Demo</a>
        </div>
      </div>

      <div class="comparison">
        <h2>When to Use Each Approach</h2>
        <div class="comparison-grid">
          <div class="comparison-item">
            <h3>Event-Based</h3>
            <ul>
              <li>Simple, standalone components</li>
              <li>Direct parent-child communication</li>
              <li>No form validation needed</li>
              <li>Custom save logic (e.g., API calls)</li>
            </ul>
          </div>
          <div class="comparison-item">
            <h3>Form-Integrated</h3>
            <ul>
              <li>Part of a larger form</li>
              <li>Validation required</li>
              <li>Need disabled state management</li>
              <li>Form-level error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2.5rem;
    }

    .intro {
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 3rem;
    }

    .demo-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .card {
      padding: 2rem;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      h2 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #333;
      }

      p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      ul {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
        color: #555;

        li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        code {
          background-color: #e9ecef;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.875rem;
        }
      }
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      transition: background-color 0.2s;

      &.btn-primary {
        background-color: #007bff;

        &:hover {
          background-color: #0056b3;
        }
      }

      &.btn-success {
        background-color: #28a745;

        &:hover {
          background-color: #218838;
        }
      }
    }

    .comparison {
      margin-top: 3rem;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      border: 1px solid #dee2e6;

      h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #333;
      }

      .comparison-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }

      .comparison-item {
        h3 {
          color: #495057;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        ul {
          padding-left: 1.5rem;
          color: #555;

          li {
            margin-bottom: 0.75rem;
            line-height: 1.5;
          }
        }
      }
    }
  `]
})
export class HomeComponent {}
