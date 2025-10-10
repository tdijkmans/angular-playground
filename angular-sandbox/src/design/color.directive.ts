import { computed, Directive, effect, ElementRef, input } from '@angular/core';
import { ColorToken, tokens } from './tokens';

@Directive({
  selector: '[appBgColor]',
})
export class BackgroundColorDirective {
  appBgColor = input<ColorToken>('neutral-0');
  color = computed(() => tokens.colors[this.appBgColor()] || 'transparent');

  constructor(private el: ElementRef) {
    effect(() => {
      this.el.nativeElement.style.backgroundColor = this.color();
    });
  }
}

@Directive({
  selector: '[appTextColor]',
})
export class TextColorDirective {
  appTextColor = input<ColorToken>('primary-500');
  color = computed(() => tokens.colors[this.appTextColor()] || 'transparent');

  constructor(private el: ElementRef) {
    effect(() => {
      this.el.nativeElement.style.color = this.color();
    });
  }
}
