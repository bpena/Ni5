import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";
import {NodeService} from "./node.service";
import {Node} from "./node";

@Injectable()
export class NodeDataService {
  public  sending: boolean;
  private filterValues: any[];
  private definitionList: any[];
  private nodeList: any[];
  private nodeTree: any[];
  private nodeListedObserver: BehaviorSubject<any[]>;
  private nodeSelectedListObserver: BehaviorSubject<any[]>;
  private nodeDeselectedListObserver: BehaviorSubject<any[]>;
  private nodeFilteredListObserver: BehaviorSubject<any[]>;
  private nodeMapFilteredListObserver: BehaviorSubject<any[]>;
  private deltaObserver: BehaviorSubject<any[]>;

  constructor(
    private sanitizer: DomSanitizer,
    private nodeService: NodeService
  ) {
    this.nodeListedObserver = new BehaviorSubject([]);
    this.nodeSelectedListObserver = new BehaviorSubject([]);
    this.nodeDeselectedListObserver = new BehaviorSubject([]);
    this.nodeFilteredListObserver = new BehaviorSubject([]);
    this.nodeMapFilteredListObserver = new BehaviorSubject([]);
    this.deltaObserver = new BehaviorSubject([]);
    this.sending = false;
  }

  public setDefinitionList(definitionList: any[]): void  {
    this.definitionList = definitionList;
  }

  private updateNodeData(nodeData: any): any {
    nodeData.isSelected = false;
    nodeData.isFiltered = false;
    nodeData.isExpanded = false;
    nodeData.normalizedData = this.normalizeData(Object.assign({}, nodeData.data), nodeData.entityId);
    return nodeData;
  }

  public setNodeList(nodeList: any[]): void {
    if (this.definitionList == null || nodeList == null)
      return;

    let nodeData: any;
    this.nodeList = [];
    this.nodeTree = [];

    for (let index in nodeList) {
      nodeData = this.updateNodeData(nodeList[index]);
      this.nodeList[nodeData.id] = nodeData;
    }

    this.sending = true;
    this.nodeListedObserver.next(this.nodeList);
    this.nodeFilteredListObserver.next([]);
    this.nodeSelectedListObserver.next([]);
    this.sending = false;
  }

  public addNode(node: any): void {
    this.addNodes([node]);
  }

  public addNodes(nodeList: any[]): void {
    if (this.definitionList == null || nodeList == null)
      return;

    nodeList.forEach(nodeData => {
      nodeData = this.updateNodeData(nodeData);
      nodeData.isSelected = true;
      this.nodeList[nodeData.id] = nodeData;
    });

    this.deltaObserver.next(nodeList);
  }

  public getListedNodes(): BehaviorSubject<any[]> {
    return this.nodeListedObserver;
  }

  public selectNode(nodeId: number): void {
    this.selectNodes([nodeId]);
  }

  public selectNodes(nodeIds: number[]): void {
    this.sending = true;
    nodeIds.forEach(id => { this.nodeList[id].isSelected = true; });
    this.applyFilter();
    let selectedNodes: any[] = this.nodeList ? this.nodeList.filter(node => { return node.isSelected /*&& !node.isFiltered*/ && nodeIds.indexOf(node.id) > -1   ; }) : [];
    this.nodeSelectedListObserver.next(selectedNodes);

    // let nodesToDeselect: any[] = this.nodeList ? this.nodeList.filter(node => { return node.isSelected && node.isFiltered; }) : [];
    // if (nodesToDeselect.length > 0)
    //     this.nodeDeselectedListObserver.next(nodesToDeselect);
    this.sending = false;
  }

  public deselectNode(nodeId: number): void {
    this.deselectNodes([nodeId]);
  }

  public deselectNodes(nodeIds: number[]): void {
    if (nodeIds.length == 0 || !this.nodeList) return;

    this.sending = true;
    let deselectedNodes: any[] = [];
    nodeIds.forEach(id => {
      this.nodeList[id].isSelected = false;
      this.nodeList[id].isFiltered = false;
      deselectedNodes.push(this.nodeList[id]);
    });

    this.nodeDeselectedListObserver.next(deselectedNodes);
    this.sending = false;
  }

  public deselectAll(): void {
    let nodeIds: number[] = [];
    if (this.nodeList == null)
      return;
    this.nodeList
      .filter(nodeData => { return nodeData.isSelected; })
      .forEach(nodeData => { nodeIds.push(nodeData.id); })

    this.deselectNodes(nodeIds);
  }

  public reset(): void {
    this.nodeList = [];
    this.nodeSelectedListObserver.next([]);
  }

  public getSelectedNodes(): BehaviorSubject<any[]> {
    return this.nodeSelectedListObserver;
  }

  public getDeselectedNodes(): BehaviorSubject<any[]> {
    return this.nodeDeselectedListObserver;
  }

  public getFilteredNodes(): BehaviorSubject<any[]> {
    return this.nodeFilteredListObserver;
  }

  public getMapFilteredNodes(): BehaviorSubject<any[]> {
    return this.nodeMapFilteredListObserver;
  }

  public setMapFilteredNodes(nodeList: any[]): void {
    this.nodeMapFilteredListObserver.next(nodeList);
  }

  public getDelta(): BehaviorSubject<any[]> {
    return this.deltaObserver;
  }

  private normalizeData(data: any, entityId: number): any {
    let definitionIndex: number = 0;
    this.definitionList.forEach((definition, index) => {
      if (entityId == definition.id)
        definitionIndex = index;
    });

    this.definitionList[definitionIndex].attributes.forEach(attribute => {
      if (attribute.values != null && data[attribute.id]) {
        let regex = data[attribute.id].length > 3 ? /()\w+/g : /\d+/g;
        let values: any[] = data[attribute.id].match(regex);
        let valuesStr: string[] = [];
        values.forEach(value => {
          let aux:any[] = attribute.values.filter(col => {
            return col.id.toString() == value.toString();
          });
          if (aux.length > 0)
            valuesStr.push(aux[0].label);
        });
        data[attribute.id] = this.sanitizer.bypassSecurityTrustHtml(valuesStr.join(', '))
      }
      else if (data[attribute.id]) {
        data[attribute.id] = this.sanitizer.bypassSecurityTrustHtml(data[attribute.id]);
      }
    });

    return data;
  }

  public getNodeGraphData(nodeId: number): any {
    let nodeData: any = this.nodeList[nodeId];
    let attributes: any[] = this.definitionList.filter(definition => { return definition.id == nodeData.entityId; })[0].attributes;
    let attributeLon = attributes.filter(attribute => { return attribute.name == 'lon'})[0];
    let attributeLat = attributes.filter(attribute => { return attribute.name == 'lat'})[0];
    let nodeIds: any = {};
    nodeIds.lon = attributeLon ? attributeLon.id : null;
    nodeIds.lat = attributeLat ? attributeLat.id : null;

    let node = new Node();
    node.id = nodeId;
    if (nodeIds.lon)
      node.lon = nodeData.data[nodeIds.lon];
    if (nodeIds.lat)
      node.lat = nodeData.data[nodeIds.lat];

    let labelDataList = this.getDecodedData(node.id, "inLabel", true);
    let labelData = "";
    labelDataList.forEach(label => {
      if(label.value.changingThisBreaksApplicationSecurity !== undefined && label.value.changingThisBreaksApplicationSecurity !== null)
        labelData = labelData.concat(label.value.changingThisBreaksApplicationSecurity + " ");
    });

    node.labelData = labelData;
    node.tooltipData = this.getDecodedData(node.id, "inToolTip", true);
    node.iconName = 'assets/images/icons/' + nodeData.metaphor.metaphors["Default"].iconName.replace('.png', '.svg');
    node.iconClass = 'icon-' + nodeData.metaphor.metaphors["Default"].iconName.replace('.png', '');
    node.iconCode = this.nodeService.getImage(nodeData.metaphor.metaphors["Default"].iconName);
    node.isFiltered =  nodeData.isFiltered;
    node.isExpanded = nodeData.isExpanded;
    return node;
  }

  /**
   *
   * @param id
   * @param attribute
   * @param value
   * @returns {null}
   */
  getDecodedData(id: number, attribute: string, value: any): any[] {
    let result: any[] = [];
    let node: any = this.nodeList[id];
    let attributes: any[];

    let nodeDef: any[] = this.definitionList.filter(def => {
      return def.id == node.entityId;
    });

    if(!nodeDef || nodeDef.length == 0) return null;

    nodeDef = nodeDef[0];
    attributes = nodeDef["attributes"];

    attributes = attributes.filter(atr => {
      return (atr[attribute] == value);
    }).sort((left, right): number => {
      if(left["sort"] < right["sort"]) return -1;
      if(left["sort"] > right["sort"]) return 1;
      return 0;
    });

    attributes.forEach(attr => {
      result.push({
        name: attr.name,
        label: attr.label,
        value: node.normalizedData[attr.id]
      });
    });
    return result;
  }

  public setFilter(filter: any[], update?: boolean): void {
    this.filterValues = filter;
    this.applyFilter(update)
  }

  public applyFilter(update?: boolean): void {
    if (!this.filterValues)
      return;

    let filtered: boolean;
    let nodesToSelect: number[] = [];
    let nodesToDeselect: number[] = [];
    let selectedNodes = this.nodeList.filter(nodeData => { return nodeData.isSelected; });
    selectedNodes
      .forEach(nodeData => {
        filtered = false;
        for (let dataId in nodeData.data) {
          if (this.filterValues[dataId]) {
            let regex = nodeData.data[dataId].length > 3 ? /()\w+/g : /\d+/g;
            let values: any[] = nodeData.data[dataId].match(regex);
            values.forEach(valueId => {
              if (!this.filterValues[dataId][valueId])
                filtered = true;
            });
          }
        }
        if (update) {
          if (nodeData.isFiltered != filtered && filtered)
            nodesToDeselect.push(nodeData);
          else if (nodeData.isFiltered != filtered && !filtered)
            nodesToSelect.push(nodeData);
        }
        nodeData.isFiltered = filtered;
      });

    this.nodeFilteredListObserver.next(nodesToSelect.concat(nodesToDeselect));
    // if (nodesToSelect.length > 0 && update)
    //     this.nodeSelectedListObserver.next(nodesToSelect);
    //
    // if (nodesToDeselect.length > 0 && update)
    //     this.nodeDeselectedListObserver.next(nodesToDeselect);
    // this.sending = false;
  }

  public expandNode(nodeId: number) {
    this.nodeList
      .filter(node => node.id == nodeId)
      .forEach(node => node.isExpanded = true);
  }

  public collapseNode(nodeId: number) {
    this.nodeList
      .filter(node => node.id == nodeId)
      .forEach(node => node.isExpanded = false);
  }

  public collapseNodes(nodeIds: number[]): void {
    this.nodeList
      .filter(node => nodeIds.indexOf(node.id) >= 0)
      .forEach(node => node.isExpanded = false);
  }
}
