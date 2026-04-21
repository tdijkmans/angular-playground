import { FormPersistenceService } from './form-persistence.service';

describe('FormPersistenceService', () => {
  let service: FormPersistenceService;

  beforeEach(() => {
    sessionStorage.clear();
    service = new FormPersistenceService();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem / getItem', () => {
    it('should store and retrieve form data', () => {
      const data = { name: 'John', age: 30 };
      service.setItem('assessment_v1', 'case1', data);

      const result = service.getItem('assessment_v1', 'case1');
      expect(result).toEqual(data);
    });

    it('should return null when no data exists', () => {
      const result = service.getItem('assessment_v1', 'nonexistent');
      expect(result).toBeNull();
    });

    it('should isolate data between different caseIds', () => {
      service.setItem('form_v1', 'case1', { name: 'Alice' });
      service.setItem('form_v1', 'case2', { name: 'Bob' });

      expect(service.getItem('form_v1', 'case1')).toEqual({ name: 'Alice' });
      expect(service.getItem('form_v1', 'case2')).toEqual({ name: 'Bob' });
    });

    it('should isolate data between different formIds', () => {
      service.setItem('form_v1', 'case1', { v: 1 });
      service.setItem('form_v2', 'case1', { v: 2 });

      expect(service.getItem('form_v1', 'case1')).toEqual({ v: 1 });
      expect(service.getItem('form_v2', 'case1')).toEqual({ v: 2 });
    });
  });

  describe('removeItem', () => {
    it('should remove stored data', () => {
      service.setItem('form_v1', 'case1', { name: 'Alice' });
      service.removeItem('form_v1', 'case1');

      expect(service.getItem('form_v1', 'case1')).toBeNull();
    });

    it('should not throw when removing nonexistent data', () => {
      expect(() => service.removeItem('form_v1', 'nonexistent')).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should return null and warn on malformed JSON', () => {
      spyOn(console, 'warn');
      sessionStorage.setItem('draft_form_v1_case1', '{invalid json');

      const result = service.getItem('form_v1', 'case1');
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn but not throw when sessionStorage.setItem fails', () => {
      spyOn(console, 'warn');
      spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceeded');

      expect(() => service.setItem('f', 'c', { x: 1 })).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
