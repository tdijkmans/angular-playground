import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  Renderer2,
  inject,
  input,
  signal,
} from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

export type CqStrategy = 'width' | 'height' | 'both';

export interface CqBreakpoint {
  name: string;
  width?: number;
  height?: number;
}

export interface CqState {
  breakpoint: string | null;
  width: number;
  height: number;
  className: string | null;
}

@Directive({
  selector: '[appCq]',
  standalone: true,
  exportAs: 'cq',
})
export class ContainerQueryDirective implements AfterViewInit {
  readonly breakpoints = input.required<CqBreakpoint[]>({ alias: 'appCq' });
  readonly observeParent = input(false);
  readonly observeTarget = input<HTMLElement | string | null>(null);
  readonly strategy = input<CqStrategy>('width');
  readonly classPrefix = input('cq');

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  private observer?: ResizeObserver;
  private currentClass: string | null = null;

  private stateSignal = signal<CqState>({
    breakpoint: null,
    width: 0,
    height: 0,
    className: null,
  });

  private subject = new ReplaySubject<CqState>(1);

  readonly state = this.stateSignal.asReadonly();
  readonly state$: Observable<CqState> = this.subject.asObservable();

  constructor() {
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.connect();
    });
  }

  private connect() {
    const el = this.resolveTarget();
    if (!el || typeof ResizeObserver === 'undefined') return;

    this.disconnect();

    this.observer = new ResizeObserver(() => this.recalculate());
    this.observer.observe(el);
    this.recalculate();
  }

  private disconnect() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private resolveTarget(): HTMLElement | null {
    const host = this.host.nativeElement;
    const custom = this.observeTarget();

    if (custom instanceof HTMLElement) return custom;

    if (typeof custom === 'string') {
      const root = host.getRootNode();
      if ('querySelector' in root) {
        return (root as ParentNode).querySelector(custom) as HTMLElement | null;
      }
      return null;
    }

    return this.observeParent() ? host.parentElement : host;
  }

  private recalculate() {
    const target = this.resolveTarget();
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

   const match = [...this.breakpoints()]
  .reverse()
  .find(bp => this.matches(bp, width, height)) ?? null;

    const className = match ? `${this.classPrefix()}-${match.name}` : null;

    this.applyClass(className);

    const state: CqState = {
      breakpoint: match?.name ?? null,
      width,
      height,
      className,
    };

    this.stateSignal.set(state);
    this.subject.next(state);
  }

 private matches(bp: CqBreakpoint, w: number, h: number) {
  const strategy = this.strategy();

  return strategy === 'width'
    ? w >= (bp.width ?? 0)
    : strategy === 'height'
    ? h >= (bp.height ?? 0)
    : w >= (bp.width ?? 0) && h >= (bp.height ?? 0);
}

  private applyClass(next: string | null) {
    if (this.currentClass === next) return;

    if (this.currentClass) {
      this.renderer.removeClass(this.host.nativeElement, this.currentClass);
    }

    if (next) {
      this.renderer.addClass(this.host.nativeElement, next);
    }

    this.currentClass = next;
  }
}