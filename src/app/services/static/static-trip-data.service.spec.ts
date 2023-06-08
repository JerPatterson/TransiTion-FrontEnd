import { TestBed } from '@angular/core/testing';

import { StaticTripDataService } from './static-trip-data.service';

describe('StaticTripDataService', () => {
  let service: StaticTripDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticTripDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
