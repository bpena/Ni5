import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable()
export class UiService {
  private showToolbarFilter: boolean;
  private showToolbarFilterObserver: BehaviorSubject<boolean>;

  public getShowToolbarFilter(): BehaviorSubject<boolean> {
    if (this.showToolbarFilter == null)
      this.showToolbarFilterObserver = new BehaviorSubject(false);
    return this.showToolbarFilterObserver;
  }

  public setShowToolbarFilter(value: boolean): void {
    this.showToolbarFilter = value;
    this.showToolbarFilterObserver.next(value);
  }
}
