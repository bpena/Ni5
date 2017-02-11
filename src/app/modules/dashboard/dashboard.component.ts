import {Component, OnInit, ViewEncapsulation, ViewChild} from '@angular/core';
import {MdSidenav} from "@angular/material";
import {UiService} from "../../services/ui.service";
import {SecurityService} from "../../services/security/security.service";

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  host: { 'class': 'dashboard column-flex' },
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

  @ViewChild('right') right:MdSidenav;
  private showToolbarFilter: boolean;
  private view:string;

  constructor(
    private uiService: UiService,
    private securityService: SecurityService
  ) { }

  ngOnInit() {
    this.uiService.getShowToolbarFilter()
      .subscribe(
        value => {
          this.showToolbarFilter = value;
          this.right.opened = false;
        },
        error => console.log("dashboarComponent >> ngOnInit >> showToolbarFilter", error)
      )
  }

  private logout():void {
    this.securityService.logout();
  }

  private changeView(_view: string): void {
    this.view = _view;
  }
}
