import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {SchemaService} from "../../../services/connection/schema.service";
import {NodeDataService} from "../../../services/nodes/node-data.service";
import {FilterService} from "./filter.service";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FilterComponent implements OnInit {
  classAcc: any = [];
  classSubGroupContainer: boolean[] = [];
  values: any = [];
  sizeClass: string[] = ['zero', 'one', 'two', 'three', 'four', 'five',
    'six', 'seven', 'eigth', 'nine', 'ten'];
  public definitions: any[] = [];

  constructor(
    private schemaService: SchemaService,
    private nodeDataService: NodeDataService,
    private filterService: FilterService
  ) { }

  ngOnInit() {
    this.schemaService
      .getMetadata()
      .subscribe(
        metaData => {
          if (metaData) {
            this.definitions = [];
            this.classAcc = [];
            this.values = [];
            metaData['definitions'].forEach(definition => {
              let auxDef = Object.assign({}, definition);
              this.values[definition.__id] = [];
              this.classAcc.push('');
              auxDef.attributes = auxDef.attributes.filter(elem => {return elem.inFilter; });
              auxDef.attributes.forEach(elem => {
                this.values[definition.__id][elem.id] = [];
                elem.values.forEach(value => {
                  this.values[definition.__id][elem.id][value.id] = true;
                })
              });
              this.definitions.push(auxDef);
            })
          }
        }
      )
  }

  public toggle(acc: number): void {
    this.classAcc.forEach((elem, index) => {
      this.classAcc[index] = index == acc ? 'open' : '';
    });
  }

  public toggleSG(index: number): void {
    this.classSubGroupContainer[index] = this.classSubGroupContainer[index] ? false : true;
  }

  public toggleValues(definitionId: number, attributeId: number): void {
    let value = this.getChecked(definitionId, attributeId);
    for(let index in this.values[definitionId][attributeId]) {
      this.values[definitionId][attributeId][index] = !value;
    }
    this.filterService.setFilterValues(this.values);
    this.nodeDataService.setFilter(this.getFilterValues(), true);
  }

  public toggleValue(definitionId: number, attributeId: number, valueId: number): void {
    this.values[definitionId][attributeId][valueId] = !this.values[definitionId][attributeId][valueId];
    this.filterService.setFilterValues(this.values);
    this.nodeDataService.setFilter(this.getFilterValues(), true);
  }

  private getFilterValues(): boolean[] {
    let filterValues: boolean[] = [];
    this.values.forEach(definition => {
      definition.forEach((elem, index) => {
        filterValues[index] = elem;
      });
      // filterValues = filterValues.concat(definition);
    });
    return filterValues;
  }

  public getChecked(definitionId: number, attributeId: number): boolean {
    let value = this.values[definitionId][attributeId].filter(value => {return !value}).length == 0;
    return value;
  }

  public getIndeterminate(definitionId: number, attributeId: number): boolean {
    return this.values[definitionId][attributeId].filter(value => {return value}).length > 0 && this.values[definitionId][attributeId].filter(value => {return !value}).length > 0;
  }
}
