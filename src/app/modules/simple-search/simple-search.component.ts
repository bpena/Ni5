import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UiService} from "../../services/ui.service";
import {SchemaService} from "../../services/connection/schema.service";
import {NodeDataService} from "../../services/nodes/node-data.service";

@Component({
  selector: 'simple-search',
  templateUrl: 'simple-search.component.html',
  styleUrls: ['simple-search.component.css']
})
export class SimpleSearchComponent implements OnInit {

  private criteria:string = "";
  private className:string = "";
  private schemaList: any[];
  private visible: boolean;
  private selectedSchema: any;
  private selectedSchemaId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private uiService: UiService,
    private schemaService: SchemaService,
    private nodeDataService: NodeDataService
  ) { }

  ngOnInit() {
    this.visible = false;
    this.uiService.setShowToolbarFilter(false);

    this.route.params.subscribe( params => this.nodeDataService.reset() );

    this.schemaService.getSchemaList()
      .subscribe(
        responseObj => {
          this.fillSchemaList(responseObj.value);
        }
      );
  }

  private fillSchemaList(schemaList: Object) {
    this.schemaList = [];
    for (let schemaId in schemaList)
      this.schemaList.push({id: schemaId, name: schemaList[schemaId]});

    if (this.schemaList.length > 0)
      this.onSchemaSelected(this.schemaList[0]);
  }

  private onSchemaSelected(schema: any): void {
    this.selectedSchema = schema;
    this.selectedSchemaId = this.selectedSchema.id;
  }

  private onSearch():void {
    if (this.criteria && this.criteria != '')
      this.changeClassName();
  }

  private changeClassName(): void {
    let link = ['list', this.selectedSchemaId, this.criteria];
    this.router.navigate(link);
  }
}
