import {Component, OnInit, Input, ElementRef, ViewEncapsulation} from '@angular/core';
import {DropdownValue} from "../dropdown/dropdownValue";

@Component({
  selector: 'context-menu',
  templateUrl: 'contextMenu.component.html',
  styleUrls: ['contextMenu.component.css'],
  host: { 'document:click': 'offClickHandler($event)'},
  encapsulation: ViewEncapsulation.None
})
export class ContextMenuComponent {
  private expanded:boolean;
  @Input() values: DropdownValue[];

  constructor( private elementRef: ElementRef ) { }

  private onClick(item: DropdownValue): void {
    item.method(item.param);
  }

  private onChange(event: any, item: DropdownValue): void {
    // item.toggleValue = !item.toggleValue;
    item.method(item.param, item.toggleValue);
  }

  private offClickHandler(event: any): void {
    if (!this.elementRef.nativeElement.contains(event.target))
      this.expanded = false;
  }
}
