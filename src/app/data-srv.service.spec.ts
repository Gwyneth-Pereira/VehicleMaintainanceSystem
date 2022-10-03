import { TestBed } from '@angular/core/testing';

import { DataSrvService } from './data-srv.service';

describe('DataSrvService', () => {
  let service: DataSrvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSrvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
