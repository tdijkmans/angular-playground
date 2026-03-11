import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an observable from connect()', () => {
    const obs = service.connect('ws://localhost:8080');
    expect(obs).toBeDefined();
    expect(typeof obs.subscribe).toBe('function');
  });

  it('disconnect should not throw when no connection exists', () => {
    expect(() => service.disconnect()).not.toThrow();
  });
});
