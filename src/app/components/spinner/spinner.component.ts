import {Component, OnInit, Input} from '@angular/core';
import {Subscription} from "rxjs";
import {TimerObservable} from "rxjs/observable/TimerObservable";
import {BusService} from "../../services/connection/bus.service";

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

  private timerSubscription: Subscription;
  private isDelayedRunning: boolean = false;

  @Input()
  public delay: number = 300;

  @Input()
  public set isRunning(value: boolean) {
    if (!value) {
      this.isDelayedRunning = false;
      this.cancelTimeout();
      return;
    }

    if (this.timerSubscription) {
      return;
    }

    let timer = TimerObservable.create(this.delay, this.delay);
    this.timerSubscription = timer.subscribe(
      () => {
        this.isDelayedRunning = value;
        this.cancelTimeout();
      }
    );
  }

  constructor( private busService: BusService ) { }

  ngOnInit() {
    this.busService.loading
      .subscribe(
        value => this.updateIsDelayed(value)
      );
  }

  private updateIsDelayed(value: boolean): void {
    this.isDelayedRunning = value;
  }

  private cancelTimeout(): void {
    this.timerSubscription.unsubscribe();
  }

  ngOnDestroy(): any {
    this.cancelTimeout();
  }
}
