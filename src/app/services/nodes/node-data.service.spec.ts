/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NodeDataService } from './node-data.service';

describe('NodeDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NodeDataService]
    });
  });

  it('should ...', inject([NodeDataService], (service: NodeDataService) => {
    expect(service).toBeTruthy();
  }));
});
