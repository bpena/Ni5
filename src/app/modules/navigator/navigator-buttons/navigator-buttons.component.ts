import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NavigatorService} from "../navigator.service";

@Component({
  selector: 'navigator-buttons',
  templateUrl: './navigator-buttons.component.html',
  styleUrls: ['./navigator-buttons.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NavigatorButtonsComponent implements OnInit {
  private bitwiseButton: number;
  private disableMapButton: boolean;
  private mapButtonClass: string;
  private disableGraphButton: boolean;
  private graphButtonClass: string;
  private disableListButton: boolean;
  private listButtonClass: string;
  private disableDetailButton: boolean;
  private detailButtonClass: string;

  constructor( private navigatorService: NavigatorService ) { }

  ngOnInit() {
    this.bitwiseButton = 1;

    this.navigatorService.register()
      .subscribe(
        value => {this.updateButtons(value)}
      )
  }

  private toggleButton(buttonValue:number): void {
    this.bitwiseButton = this.bitwiseButton ^ buttonValue;
    this.navigatorService.setNavigatorView(this.bitwiseButton);
  }

  private updateButtons(bitwise: number) {
    this.bitwiseButton = bitwise;

    this.disableMapButton = (bitwise & 8) > 0;
    this.mapButtonClass = this.disableMapButton ? 'checked' : '';
    this.disableGraphButton = (bitwise & 4) > 0;
    this.graphButtonClass = this.disableGraphButton ? 'checked' : '';
    this.disableListButton = (bitwise & 2) > 0;
    this.listButtonClass = this.disableListButton ? 'checked' : '';
    this.disableDetailButton = (bitwise & 1) > 0;
    this.detailButtonClass = this.disableDetailButton ? 'checked' : '';
  }
}
