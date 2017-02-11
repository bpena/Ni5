/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EdgeService } from './edge.service';

describe('EdgeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EdgeService]
    });
  });

  it('should ...', inject([EdgeService], (service: EdgeService) => {
    expect(service).toBeTruthy();
  }));
});
