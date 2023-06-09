import { TestBed } from '@angular/core/testing';

import { TripShapeService } from './trip-shape.service';

describe('TripShapeService', () => {
  let service: TripShapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripShapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
