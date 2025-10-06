import { TestBed } from '@angular/core/testing';
import { ApolloDemo } from './apollo-demo.component';
import { ApolloTestingModule } from 'apollo-angular/testing';

describe('ApolloDemo', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApolloDemo, ApolloTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ApolloDemo);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
