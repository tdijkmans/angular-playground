import { TestBed } from '@angular/core/testing';
import { ComboboxDemo } from './combobox-demo.component';

describe('ComboboxDemo', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComboboxDemo],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ComboboxDemo);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
