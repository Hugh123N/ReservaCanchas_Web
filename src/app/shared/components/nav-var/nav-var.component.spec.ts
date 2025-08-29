import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavVarComponent } from './nav-var.component';

describe('NavVarComponent', () => {
  let component: NavVarComponent;
  let fixture: ComponentFixture<NavVarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavVarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavVarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
