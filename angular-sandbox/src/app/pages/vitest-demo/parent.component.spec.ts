import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { DataService } from './data.service';
import { ParentComponent } from './parent.component';
import { ParentHarness } from './parent.harness';

describe('ParentComponent', () => {
  let fixture: ComponentFixture<ParentComponent>;
  let component: ParentComponent;
  let harness: ParentHarness;

  const mockFetchData = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    mockFetchData.mockReturnValue(of({ message: 'Test data' }));

    await TestBed.configureTestingModule({
      imports: [ParentComponent],
      providers: [{ provide: DataService, useValue: { fetchData: mockFetchData } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ParentComponent);
    component = fixture.componentInstance;
    harness = new ParentHarness(fixture.debugElement);
  });

  describe('Initial signal state (before detectChanges / ngOnInit)', () => {
    it('should start in a loading state', () => {
      expect(component.isLoading()).toBe(true);
    });

    it('should have null data before ngOnInit runs', () => {
      expect(component.data()).toBeNull();
    });

    it('should have "Ready" as the initial status message', () => {
      expect(component.statusMessage()).toBe('Ready');
    });
  });

  describe('After detectChanges (ngOnInit executes)', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should exit loading state after data is fetched', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should populate the data signal with the fetched value', () => {
      expect(component.data()).toEqual({ message: 'Test data' });
    });

    it('should call DataService.fetchData exactly once on init', () => {
      expect(mockFetchData).toHaveBeenCalledOnce();
    });

    it('should render the status element with "Ready" text', () => {
      expect(harness.statusElement.textContent?.trim()).toBe('Ready');
    });

    it('should render the child component with the fetched label', () => {
      expect(fixture.debugElement.nativeElement.textContent).toContain('Test data');
    });
  });

  describe('Deep UI interaction via multi-layered harness', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update status text when the grandchild action button is clicked', () => {
      harness.child.grandchild.clickActionButton();
      fixture.detectChanges();

      expect(harness.statusElement.textContent?.trim()).toBe('Action triggered');
    });

    it('should update the statusMessage signal after the grandchild action', () => {
      harness.child.grandchild.clickActionButton();
      fixture.detectChanges();

      expect(component.statusMessage()).toBe('Action triggered');
    });
  });

  describe('Mock cleanup between tests', () => {
    it('should not carry over call count from a previous test', () => {
      // vi.clearAllMocks() in beforeEach ensures a clean slate each time
      expect(mockFetchData).not.toHaveBeenCalled();
    });
  });
});
