import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AlertService} from "./alert.service";
import {TimerObservable} from "rxjs/observable/TimerObservable";

@Component({
  selector: 'ni5-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  private timerSubscription: Subscription;
  private visible: boolean = false;
  private message: string = "";

  constructor(private alertService: AlertService) {
  }

  ngOnInit() {
    this.alertService.getObservable().subscribe(
      message => this.showMessage(message)
    );
  }

  private showMessage(message: string): void {
    if (message.length == 0 || this.visible)
      return;

    this.visible = true;
    this.message = message;
    let timer = TimerObservable.create(20000);
    this.timerSubscription = timer.subscribe(
      () => {
        this.visible = false;
        this.timerSubscription.unsubscribe();
      }
    );
  }

  public closeAlert(): void {
    this.visible = false;
  }

}
