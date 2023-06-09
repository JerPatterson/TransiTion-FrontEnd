import { TestBed } from '@angular/core/testing';

import { StopMarkerService } from './stop-marker.service';

describe('StopMarkerService', () => {
  let service: StopMarkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StopMarkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
