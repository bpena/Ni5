import {Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {SchemaValue} from "./schemaValue";
import {SecurityService} from "../../services/security/security.service";
import {SchemaService} from "../../services/connection/schema.service";

@Component({
  selector: 'schema-selector',
  templateUrl: 'schemaSelector.component.html',
  styleUrls: ['schemaSelector.component.css'],
  host: {
    'class': 'schema-selector',
    '(document:click)': 'offClickHandler($event)'
  },
  encapsulation: ViewEncapsulation.None
})
export class SchemaSelectorComponent implements OnInit {

  private visible:boolean = false;
  private selectedSchema: any;
  private values: SchemaValue[];

  @Input()
  selectedId: number;

  @Output()
  select: EventEmitter<any>;

  constructor(
    private securityService: SecurityService,
    private schemaService: SchemaService,
    private elementRef: ElementRef
  ) {
    this.select = new EventEmitter();
  }

  ngOnInit() {
    this.schemaService.getSchemaList()
      .subscribe(
        schemaList => {
          this.values = [];
          for (let schemaId in schemaList.value)
            this.values.push({id: schemaId, name: schemaList.value[schemaId]});

          this.schemaService.getCurrentSchema()
            .subscribe(schemaId => {
              if (this.selectedSchema != schemaId) {
                this.selectedSchema = schemaId;
                let selected = this.values.filter(schema => {return schema.id == this.selectedSchema})[0];
                this.select.emit(selected);
              }
            })
        }
      );
  }

  private offClickHandler(event: any): void {
    if (!this.elementRef.nativeElement.contains(event.target))
      this.visible = false;
  }

  private selectItem(value): void {
    this.selectedSchema = value.id;
    this.visible = false;
    this.schemaService.setCurrentData(null, null);
    this.select.emit(value);
  }

  private onClick(): void {
    this.visible = !this.visible;
  }
}
