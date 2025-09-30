import { TestBed } from '@angular/core/testing';
import { FocusService } from './focus.service';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Router } from '@angular/router';
import { ElementRef, QueryList } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';

describe('FocusService', () => {
  let service: FocusService;
  let focusMonitor: jasmine.SpyObj<FocusMonitor>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const focusMonitorSpy = jasmine.createSpyObj('FocusMonitor', ['focusVia', 'stopMonitoring']);
    const routerSpy = jasmine.createSpyObj('Router', [], { events: of() });

    TestBed.configureTestingModule({
      providers: [
        FocusService,
        { provide: FocusMonitor, useValue: focusMonitorSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(FocusService);
    focusMonitor = TestBed.inject(FocusMonitor) as jasmine.SpyObj<FocusMonitor>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('focus', () => {
    it('should focus an element with default origin', () => {
      const mockElement = { nativeElement: document.createElement('button') } as ElementRef;
      
      service.focus(mockElement);

      expect(focusMonitor.focusVia).toHaveBeenCalledWith(mockElement, 'program');
    });

    it('should focus an element with custom origin', () => {
      const mockElement = { nativeElement: document.createElement('button') } as ElementRef;
      
      service.focus(mockElement, 'keyboard');

      expect(focusMonitor.focusVia).toHaveBeenCalledWith(mockElement, 'keyboard');
    });

    it('should remember the last focused element', () => {
      const mockElement = { nativeElement: document.createElement('button') } as ElementRef;
      
      service.focus(mockElement);
      service.restoreFocus();

      expect(focusMonitor.focusVia).toHaveBeenCalledTimes(2);
      expect(focusMonitor.focusVia).toHaveBeenCalledWith(mockElement, 'program');
    });
  });

  describe('restoreFocus', () => {
    it('should restore focus to the last focused element', () => {
      const mockElement = { nativeElement: document.createElement('button') } as ElementRef;
      
      service.focus(mockElement);
      service.restoreFocus();

      expect(focusMonitor.focusVia).toHaveBeenCalledTimes(2);
    });

    it('should do nothing if no element was focused', () => {
      service.restoreFocus();

      expect(focusMonitor.focusVia).not.toHaveBeenCalled();
    });
  });

  describe('focusFirst', () => {
    it('should focus the first element in a QueryList', () => {
      const mockElement1 = { nativeElement: document.createElement('input') } as ElementRef;
      const mockElement2 = { nativeElement: document.createElement('input') } as ElementRef;
      const queryList = {
        first: mockElement1,
        toArray: () => [mockElement1, mockElement2]
      } as unknown as QueryList<ElementRef>;

      service.focusFirst(queryList);

      expect(focusMonitor.focusVia).toHaveBeenCalledWith(mockElement1, 'program');
    });

    it('should do nothing if QueryList is empty', () => {
      const queryList = {
        first: undefined,
        toArray: () => []
      } as unknown as QueryList<ElementRef>;

      service.focusFirst(queryList);

      expect(focusMonitor.focusVia).not.toHaveBeenCalled();
    });
  });

  describe('focusFirstInvalid', () => {
    it('should focus the first invalid form field', () => {
      const mockElement1 = { nativeElement: document.createElement('input') } as ElementRef;
      const mockElement2 = { nativeElement: document.createElement('input') } as ElementRef;
      const queryList = {
        toArray: () => [mockElement1, mockElement2]
      } as unknown as QueryList<ElementRef>;

      const formGroup = new FormGroup({
        field1: new FormControl('', Validators.required),
        field2: new FormControl('', Validators.required)
      });

      // Mark first field as touched and invalid
      formGroup.get('field1')?.markAsTouched();
      formGroup.get('field1')?.setValue('');

      service.focusFirstInvalid(formGroup, queryList);

      expect(focusMonitor.focusVia).toHaveBeenCalledWith(mockElement1, 'program');
    });

    it('should not focus if no fields are invalid', () => {
      const mockElement = { nativeElement: document.createElement('input') } as ElementRef;
      const queryList = {
        toArray: () => [mockElement]
      } as unknown as QueryList<ElementRef>;

      const formGroup = new FormGroup({
        field1: new FormControl('valid value', Validators.required)
      });

      service.focusFirstInvalid(formGroup, queryList);

      expect(focusMonitor.focusVia).not.toHaveBeenCalled();
    });
  });

  describe('focusAtIndex', () => {
    it('should focus element at specified index', () => {
      const mockElement1 = { nativeElement: document.createElement('input') } as ElementRef;
      const mockElement2 = { nativeElement: document.createElement('input') } as ElementRef;
      const queryList = {
        toArray: () => [mockElement1, mockElement2]
      } as unknown as QueryList<ElementRef>;

      service.focusAtIndex(queryList, 1);

      expect(focusMonitor.focusVia).toHaveBeenCalledWith(mockElement2, 'program');
    });

    it('should do nothing if index is out of bounds', () => {
      const queryList = {
        toArray: () => []
      } as unknown as QueryList<ElementRef>;

      service.focusAtIndex(queryList, 5);

      expect(focusMonitor.focusVia).not.toHaveBeenCalled();
    });
  });

  describe('clearLastFocused', () => {
    it('should clear the last focused element', () => {
      const mockElement = { nativeElement: document.createElement('button') } as ElementRef;
      
      service.focus(mockElement);
      service.clearLastFocused();
      service.restoreFocus();

      expect(focusMonitor.focusVia).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring an element', () => {
      const mockElement = { nativeElement: document.createElement('button') } as ElementRef;
      
      service.stopMonitoring(mockElement);

      expect(focusMonitor.stopMonitoring).toHaveBeenCalledWith(mockElement);
    });
  });
});
