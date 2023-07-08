import { TestBed } from '@angular/core/testing';

import { VehicleMarkerService } from './vehicle-marker.service';

describe('VehicleMarkerService', () => {
  let service: VehicleMarkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleMarkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
