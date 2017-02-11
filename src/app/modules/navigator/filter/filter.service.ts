import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable()
export class FilterService {
  private filterValues: any[];
  private filterValuesObserver: BehaviorSubject<any[]>;

  public constructor() {
    this.filterValuesObserver = new BehaviorSubject([]);
  }

  public getFilterValues():BehaviorSubject<any[]> {
    return this.filterValuesObserver;
  }

  public setFilterValues(filter: any[]): void {
    this.filterValues = filter;
    this.filterValuesObserver.next(filter);
  }
}
