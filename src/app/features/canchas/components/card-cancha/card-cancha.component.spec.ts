import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCanchaComponent } from './card-cancha.component';

describe('CardCanchaComponent', () => {
  let component: CardCanchaComponent;
  let fixture: ComponentFixture<CardCanchaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCanchaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCanchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
