import { TestBed } from '@angular/core/testing';

import { StaticStopDataService } from './static-stop-data.service';

describe('StaticStopDataService', () => {
  let service: StaticStopDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticStopDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
