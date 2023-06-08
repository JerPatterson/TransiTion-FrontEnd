import { TestBed } from '@angular/core/testing';

import { StaticServiceDataService } from './static-service-data.service';

describe('StaticServiceDataService', () => {
  let service: StaticServiceDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticServiceDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
