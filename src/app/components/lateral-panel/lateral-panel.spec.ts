import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LateralPanel } from './lateral-panel';

describe('LateralPanel', () => {
  let component: LateralPanel;
  let fixture: ComponentFixture<LateralPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LateralPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LateralPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
