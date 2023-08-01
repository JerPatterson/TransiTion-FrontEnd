import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripDirectionComponent } from './trip-direction.component';

describe('TripDirectionComponent', () => {
  let component: TripDirectionComponent;
  let fixture: ComponentFixture<TripDirectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TripDirectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
