import { TestBed } from '@angular/core/testing';
import { ApolloService } from './apollo.service';
import { ApolloTestingModule } from 'apollo-angular/testing';

describe('ApolloService', () => {
  let service: ApolloService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [ApolloService]
    });
    service = TestBed.inject(ApolloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
