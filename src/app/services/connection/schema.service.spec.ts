/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SchemaService } from './schema.service';

describe('SchemaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchemaService]
    });
  });

  it('should ...', inject([SchemaService], (service: SchemaService) => {
    expect(service).toBeTruthy();
  }));
});
