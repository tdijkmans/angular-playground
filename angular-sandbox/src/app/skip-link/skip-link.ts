import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skip-link',
  imports: [],
  templateUrl: './skip-link.html',
  styleUrl: './skip-link.scss'
})
export class SkipLink {
  @Input() target: string = '#main-navigation';
  @Input() text: string = 'Skip to main navigation';

  onSkipLinkClick(event: Event): void {
    event.preventDefault();
    const targetElement = document.querySelector(this.target) as HTMLElement;
    if (targetElement) {
      // Set tabindex to -1 to make element focusable programmatically
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      
      // Remove tabindex after focus for clean DOM
      targetElement.addEventListener('blur', () => {
        targetElement.removeAttribute('tabindex');
      }, { once: true });
    }
  }
}
