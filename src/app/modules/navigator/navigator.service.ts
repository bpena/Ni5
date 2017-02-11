import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable()
export class NavigatorService {
  private navigatorView: number;
  private navigatorViewObservable: BehaviorSubject<number>;

  constructor() {
    this.navigatorViewObservable = new BehaviorSubject(2);
  }

  public register(): BehaviorSubject<number> {
    return this.navigatorViewObservable;
  }

  public setNavigatorView(value: number): void {
    this.navigatorView = value;
    this.navigatorViewObservable.next(this.navigatorView);
  }
}
