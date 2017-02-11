import {Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {MdCheckboxChange} from "@angular/material";

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
  host: { 'class': 'column-flex' },
  encapsulation: ViewEncapsulation.None
})
export class GridComponent {
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() showIcon: boolean = false;
  @Input() selectionMode: string = 'single';

  @Output() deselected: EventEmitter<any> = new EventEmitter();
  @Output() selected: EventEmitter<any> = new EventEmitter();
  @Output() clicked: EventEmitter<any> = new EventEmitter();
  @Output() over: EventEmitter<any> = new EventEmitter();
  @Output() selectedAll: EventEmitter<any[]> = new EventEmitter();
  @Output() deselectedAll: EventEmitter<any[]> = new EventEmitter();

  private onChangeSelection(event: MdCheckboxChange, node: any): void {
    node.isSelected = event.checked;
    if (event.checked)
      this.selected.emit(node);
    else
      this.deselected.emit(node);
  }

  private onChangeSelectionAll(event: MdCheckboxChange): void {
    this.data.forEach(elem => elem.isSelected = event.checked );
    if (event.checked)
      this.selectedAll.emit(this.data);
    else
      this.deselectedAll.emit(this.data);
  }

  private onMouseover(event: any, node: any): void {
    this.over.emit(node);
  }

  private onClicked(event: any, node: any): void {
    this.clicked.emit(node);
  }
}
