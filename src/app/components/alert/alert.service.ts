import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable()
export class AlertService {
  private alertObservable: BehaviorSubject<any>;

  constructor() {
    this.alertObservable = new BehaviorSubject("");
  }

  public showMessage(message: string): void {
    this.alertObservable.next(message);
  }

  public getObservable(): BehaviorSubject<any> {
    return this.alertObservable;
  }

}
