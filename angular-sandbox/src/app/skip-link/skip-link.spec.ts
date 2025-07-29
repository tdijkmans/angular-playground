import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkipLink } from './skip-link';

describe('SkipLink', () => {
  let component: SkipLink;
  let fixture: ComponentFixture<SkipLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkipLink]
    }).compileComponents();

    fixture = TestBed.createComponent(SkipLink);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default skip link text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link');
    expect(skipLink?.textContent?.trim()).toBe('Skip to main navigation');
  });

  it('should render custom text when provided', () => {
    component.text = 'Skip to content';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link');
    expect(skipLink?.textContent?.trim()).toBe('Skip to content');
  });

  it('should use default target when not provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link') as HTMLAnchorElement;
    expect(skipLink?.href).toContain('#main-navigation');
  });

  it('should use custom target when provided', () => {
    component.target = '#custom-target';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link') as HTMLAnchorElement;
    expect(skipLink?.href).toContain('#custom-target');
  });

  it('should have proper accessibility attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link') as HTMLAnchorElement;
    
    expect(skipLink?.getAttribute('aria-label')).toBe('Skip to main navigation');
  });

  it('should focus target element when clicked', () => {
    // Create a mock target element
    const targetElement = document.createElement('div');
    targetElement.id = 'main-navigation';
    document.body.appendChild(targetElement);
    
    const focusSpy = spyOn(targetElement, 'focus');
    const setAttributeSpy = spyOn(targetElement, 'setAttribute');
    
    // Mock querySelector to return our target element
    spyOn(document, 'querySelector').and.returnValue(targetElement);
    
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link') as HTMLAnchorElement;
    
    // Simulate click event
    const clickEvent = new Event('click');
    spyOn(clickEvent, 'preventDefault');
    
    skipLink.click();
    component.onSkipLinkClick(clickEvent);
    
    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(setAttributeSpy).toHaveBeenCalledWith('tabindex', '-1');
    expect(focusSpy).toHaveBeenCalled();
    
    // Clean up
    document.body.removeChild(targetElement);
  });

  it('should handle missing target element gracefully', () => {
    spyOn(document, 'querySelector').and.returnValue(null);
    
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link') as HTMLAnchorElement;
    
    const clickEvent = new Event('click');
    spyOn(clickEvent, 'preventDefault');
    
    // Should not throw an error
    expect(() => {
      component.onSkipLinkClick(clickEvent);
    }).not.toThrow();
    
    expect(clickEvent.preventDefault).toHaveBeenCalled();
  });
});