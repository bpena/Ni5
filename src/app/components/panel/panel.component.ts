import {Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import {DropdownValue} from "../dropdown/dropdownValue";

@Component({
  selector: 'ni5-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css'],
  host: { 'class': 'column-flex' },
  encapsulation: ViewEncapsulation.None
})
export class PanelComponent {
  @Input() title: string;
  @Input() menuOptions: DropdownValue[];
  @Input() showMenu: boolean = false;
  @Input() showMaximize: boolean = false;
}
