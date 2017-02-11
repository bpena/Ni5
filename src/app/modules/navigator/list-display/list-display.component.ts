import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NodeService} from "../../../services/nodes/node.service";
import {NodeDataService} from "../../../services/nodes/node-data.service";
import {SchemaService} from "../../../services/connection/schema.service";
import {SearchService} from "../../../services/connection/search.service";
import {ResponseObj} from "../../../services/connection/response.obj";

@Component({
  selector: 'list-display',
  templateUrl: './list-display.component.html',
  styleUrls: ['./list-display.component.css'],
  host: { 'class': 'column-flex'},
  encapsulation: ViewEncapsulation.None
})
export class ListDisplayComponent implements OnInit {

  private criteria: string;
  private schema: number;
  private dataList: any;

  private currentTab: number;
  private tabs: any[];
  private tabGridColumns: any[] = [];
  private tabGridColumnsLimited: any[] = [];
  private tabGridData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private nodeService: NodeService,
    private nodeDataService: NodeDataService,
    private schemaService: SchemaService,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    let model = this;
    this.route.params.subscribe(params => {
      this.criteria = params['criteria'] || '';
      this.schema = params['schema'];

      this.schemaService.getSchemaData(this.schema)
        .subscribe(response => {
          this.clearSelection();
          this.nodeDataService.setDefinitionList(response.value.definitions);
          this.schemaService.setMetadata(response.value);
        });
    });

    /**
     * Get data of selected Schema
     */
    this.schemaService.getMetadata().subscribe(metadata => {
      if (metadata != null) {
        let responseObj: ResponseObj = new ResponseObj();
        responseObj.value = metadata;
        this.setTabs(responseObj);
      }
    });

    /**
     * Get node data.
     */
    this.nodeDataService.getListedNodes().subscribe(nodeList => {
      this.setData(nodeList);
    });

    this.nodeDataService.getDelta().subscribe(nodeList => {
      if (nodeList.length > 0) {
        this.setData(nodeList);
        this.setSelected(nodeList, true);
        let nodesId: number[] = [];
        nodeList.forEach(node => nodesId.push(node.id));
        this.nodeDataService.selectNodes(nodesId);
      }
    })

    this.nodeDataService.getDeselectedNodes().subscribe(nodeList => {
      if (nodeList.length > 0)
        this.setSelected(nodeList, false);
    })
  }

  private selectedTab(event: any): void {
    this.currentTab = event.index;
  }

  private clearSelection(): void {

  }

  private setTabs(response: ResponseObj): void {
    this.tabs = response.value.definitions.filter(tab => tab.objectTypeId == 2);

    this.currentTab = 0;
    this.tabGridData = [];
    this.tabGridColumns = [];
    this.tabGridColumnsLimited = [];

    this.tabs.forEach(tab => {
      this.tabGridData.push([]);

      let columns: any[] = tab.attributes
        .filter(attribute => attribute.inMatrix != null && attribute.inMatrix > 0);
      this.tabGridColumns.push(columns);
      this.tabGridColumnsLimited.push(
        columns.filter((elem, index) => {return index < 9; })
      );
    });

    if (this.criteria && this.criteria != '')
      this.searchService.getList(this.criteria, this.schema)
        .subscribe(response => {
          this.dataList = response.value;
          this.nodeDataService.setNodeList(response.value);
        });
  }

  private setData(nodeList: any[]): void {
    if (nodeList == null || nodeList.length == 0) return;

    let tabGridData: any[] = [];

    this.tabs.forEach(tab => {
      tabGridData.push(nodeList.filter(data => {
        let length = 0;
        this.tabGridData.forEach(tabGrid => {
          length += tabGrid.filter(tabData => { return tabData.id == data.id }).length;
        });
        return (data.entityId == tab.id && length == 0);
      }))
    });

    for (let i: number = 0; i < this.tabs.length; i++)
      if (!this.tabGridData[i])
        this.tabGridData[i] = [];

    for (let i: number = 0; i < this.tabGridData.length; i++)
      this.tabGridData.push.apply(this.tabGridData[i], tabGridData[i]);

  }

  private setSelected(nodeList: any[], value: boolean): void {
    this.tabs.forEach((tab, index) => {
      this.tabGridData[index]
        .filter( data => nodeList.findIndex( node => node.id == data.id ) >= 0 )
        .forEach( node => node.isSelected = value );
    });
  }

  private onSelected(node: any): void {
    this.nodeDataService.selectNode(node.id);
  }

  private onDeselected(node: any): void {
    this.nodeDataService.collapseNode(node.id);
    this.nodeDataService.deselectNode(node.id);
  }

  private onSelectedAll(nodeList: any[]): void {
    let nodeIds: number[] = nodeList.map(node => node.id);
    this.nodeDataService.collapseNodes(nodeIds);
    this.nodeDataService.selectNodes(nodeIds);
  }

  private onDeselectedAll(nodeList: any[]): void {
    let nodeIds: number[] = nodeList.map(node => node.id);
    this.nodeDataService.collapseNodes(nodeIds);
    this.nodeDataService.deselectNodes(nodeIds);
  }

  private onMouseover(node: any): void {
  }

  private onClicked(node: any): void {
    let columns: any[] = this.tabGridColumns[this.currentTab];
    let element: any = node;
    this.schemaService.setCurrentData(columns, element);
  }
}
