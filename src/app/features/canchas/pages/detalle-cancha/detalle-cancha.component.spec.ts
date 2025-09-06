import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCanchaComponent } from './detalle-cancha.component';

describe('DetalleCanchaComponent', () => {
  let component: DetalleCanchaComponent;
  let fixture: ComponentFixture<DetalleCanchaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCanchaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCanchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
