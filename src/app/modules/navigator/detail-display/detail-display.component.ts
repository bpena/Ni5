import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DropdownValue} from "../../../components/dropdown/dropdownValue";
import {SchemaService} from "../../../services/connection/schema.service";

@Component({
  selector: 'detail-display',
  templateUrl: './detail-display.component.html',
  styleUrls: ['./detail-display.component.css'],
  host: {'class' : 'graph-view column-flex'},
  encapsulation: ViewEncapsulation.None
})
export class DetailDisplayComponent implements OnInit {
  private dataDetail: any[];

  menuOptions: DropdownValue[] = [
    {value:1, label:'Isolate selection', method:null, type:'item', param: this, toggle: false,
      toggleValue: null},
    {value:2, label:'Remove selection', method:null, type:'item', param: this, toggle: false,
      toggleValue: null},
    {value:3, label:'Clear selection', method:null, type:'item', param: this, toggle: false,
      toggleValue: null},
    {value:4, label:'Clear all', method:null, type:'item', param:this, toggle:false, toggleValue: null},
    {value:5, label:null, method:null, type:'separator', param: null, toggle: false, toggleValue: null},
    {value:6, label:'Show node labels', method: null, type:'item', param:this, toggle:true,
      toggleValue:null},
    {value:7, label:'Show directed graph', method:null, type:'item', param:null, toggle:true,
      toggleValue:false},
    {value:8, label:'Show edge thickness', method:null, type:'item', param:null, toggle:true,
      toggleValue:false},
    {value:9, label:'Show edge count', method:null, type:'item', param:this, toggle:true,
      toggleValue:null}
  ];

  constructor( private schemaService: SchemaService ) { }

  ngOnInit() {
    this.schemaService.getCurrentData()
      .subscribe(data => { this.setDataDetail(data); });
  }

  private setDataDetail(data:any) {
    this.dataDetail = [];
    if (data && data.attributes && data.element) {
      let element: any;
      data.attributes.forEach(att => {
        element = {
          label: att.label,
          value: data.element.normalizedData[att.id]
        };
        this.dataDetail.push(element);
      })
    }
  }
}
