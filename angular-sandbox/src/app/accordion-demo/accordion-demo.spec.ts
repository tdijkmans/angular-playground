import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { AccordionGroup } from '../accordion/accordion-group';
import { AccordionItem } from '../accordion/accordion-item';
import { AccordionDemo } from './accordion-demo';

// ─── AccordionGroup ───────────────────────────────────────────────────────────

describe('AccordionGroup', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionGroup],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccordionGroup);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply parent variant class by default', () => {
    const fixture = TestBed.createComponent(AccordionGroup);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.accordion-group');
    expect(el.classList).toContain('accordion-group--parent');
    expect(el.classList).not.toContain('accordion-group--child');
  });

  it('should apply child variant class when variant="child"', () => {
    const fixture = TestBed.createComponent(AccordionGroup);
    fixture.componentInstance.variant = 'child';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.accordion-group');
    expect(el.classList).toContain('accordion-group--child');
    expect(el.classList).not.toContain('accordion-group--parent');
  });

  it('should set aria-label when label is provided', () => {
    const fixture = TestBed.createComponent(AccordionGroup);
    fixture.componentInstance.label = 'My group';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.accordion-group');
    expect(el.getAttribute('aria-label')).toBe('My group');
  });

  it('should omit aria-label when label is empty', () => {
    const fixture = TestBed.createComponent(AccordionGroup);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.accordion-group');
    expect(el.getAttribute('aria-label')).toBeNull();
  });

  it('should have role="group"', () => {
    const fixture = TestBed.createComponent(AccordionGroup);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');
    expect(el).toBeTruthy();
  });
});

// ─── AccordionItem ────────────────────────────────────────────────────────────

describe('AccordionItem', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionItem],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccordionItem);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a <details> element', () => {
    const fixture = TestBed.createComponent(AccordionItem);
    fixture.detectChanges();
    const details = fixture.nativeElement.querySelector('details');
    expect(details).toBeTruthy();
  });

  it('should render a <summary> element inside <details>', () => {
    const fixture = TestBed.createComponent(AccordionItem);
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector('details > summary');
    expect(summary).toBeTruthy();
  });

  it('should display the summary text', () => {
    const fixture = TestBed.createComponent(AccordionItem);
    fixture.componentInstance.summary = 'Test heading';
    fixture.detectChanges();
    const label: HTMLElement = fixture.nativeElement.querySelector('.accordion-item__label');
    expect(label?.textContent?.trim()).toBe('Test heading');
  });

  it('should not have open attribute by default', () => {
    const fixture = TestBed.createComponent(AccordionItem);
    fixture.detectChanges();
    const details: HTMLDetailsElement = fixture.nativeElement.querySelector('details');
    expect(details.hasAttribute('open')).toBeFalse();
  });

  it('should have open attribute when open=true', () => {
    const fixture = TestBed.createComponent(AccordionItem);
    fixture.componentInstance.open = true;
    fixture.detectChanges();
    const details: HTMLDetailsElement = fixture.nativeElement.querySelector('details');
    expect(details.hasAttribute('open')).toBeTrue();
  });

  it('should render a content region', () => {
    const fixture = TestBed.createComponent(AccordionItem);
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.accordion-item__content');
    expect(content).toBeTruthy();
  });

  it('should project ng-content into content region', () => {
    @Component({
      template: `<app-accordion-item summary="Q">Answer text</app-accordion-item>`,
      imports: [AccordionItem],
      standalone: true,
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    const content: HTMLElement = hostFixture.nativeElement.querySelector(
      '.accordion-item__content',
    );
    expect(content?.textContent?.trim()).toBe('Answer text');
  });
});

// ─── AccordionDemo ────────────────────────────────────────────────────────────

describe('AccordionDemo', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionDemo],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccordionDemo);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a parent-variant accordion group', () => {
    const fixture = TestBed.createComponent(AccordionDemo);
    fixture.detectChanges();
    const parent = fixture.debugElement.query(
      By.css('.accordion-group--parent'),
    );
    expect(parent).toBeTruthy();
  });

  it('should render a child-variant accordion group', () => {
    const fixture = TestBed.createComponent(AccordionDemo);
    fixture.detectChanges();
    const children = fixture.debugElement.queryAll(
      By.css('.accordion-group--child'),
    );
    expect(children.length).toBeGreaterThan(0);
  });

  it('should render multiple accordion items', () => {
    const fixture = TestBed.createComponent(AccordionDemo);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('details');
    expect(items.length).toBeGreaterThan(1);
  });
});
