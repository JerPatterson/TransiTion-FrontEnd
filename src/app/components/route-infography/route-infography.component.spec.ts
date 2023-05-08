import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteInfographyComponent } from './route-infography.component';

describe('RouteInfographyComponent', () => {
  let component: RouteInfographyComponent;
  let fixture: ComponentFixture<RouteInfographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteInfographyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteInfographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
