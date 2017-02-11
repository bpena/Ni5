import { Injectable } from '@angular/core';
import {Edge} from "./edge";
import {BehaviorSubject} from "rxjs";
import {NodeDataService} from "../nodes/node-data.service";
declare var L: any;

@Injectable()
export class EdgeService {

  private edgeList: Edge[];
  private edgeListObservable: BehaviorSubject<Edge[]>;
  private edgeFilteredObservable: BehaviorSubject<Edge[]>;

  constructor( private nodeDataService: NodeDataService ) {
    this.edgeList = [];
    this.edgeListObservable = new BehaviorSubject([]);
    this.edgeFilteredObservable = new BehaviorSubject([]);

    this.nodeDataService.getFilteredNodes().subscribe(nodeList => {
      this.filterEdges(nodeList);
    });

    this.nodeDataService.getDeselectedNodes().subscribe(nodeList => {
      this.deselectedNodes(nodeList);
    });
  }

  public registerEdgeList(): BehaviorSubject<Edge[]> {
    return this.edgeListObservable;
  }

  public getFilteredEdgeList(): BehaviorSubject<Edge[]> {
    return this.edgeFilteredObservable;
  }

  private filterEdges(nodeList: any[]): void {
    nodeList.forEach(node => {
      this.edgeList
        .filter(edge => edge.parentNodeId == node.id)
        .concat(this.edgeList.filter(edge => edge.childNodeId == node.id))
        .forEach(edge => edge.isFiltered = node.isFiltered)
    });
    this.edgeFilteredObservable.next(this.edgeList);
  }

  public addEdge(edge: Edge): void {
    this.addEdges([edge]);
  }

  public addEdges(edgeList: Edge[]): void {
    edgeList.forEach(edge => {
      if (!this.edgeExist(edge))
        this.edgeList.push(edge);
    });

    console.log(this.edgeList);

    this.edgeListObservable.next(this.edgeList);
  }

  public removeEdge(edge: Edge): void {
    this.removeEdges([edge]);
  }

  public removeEdges(edgeList: Edge[]): void {
    let pos: number;
    edgeList.forEach(edge => {
      pos = this.edgeList.findIndex(e => {
        return  (e.parentNodeId == edge.parentNodeId && e.childNodeId == edge.childNodeId) ||
          (e.childNodeId == edge.parentNodeId && e.parentNodeId == edge.childNodeId);
      });
      this.edgeList = this.edgeList.slice(pos, 1);
    });

    this.edgeListObservable.next(this.edgeList);
  }

  private edgeExist(edge: Edge): boolean {
    let exist: boolean;
    exist = (this.edgeList.findIndex(e => e.parentNodeId == edge.parentNodeId) >= 0 &&
      this.edgeList.findIndex(e => e.childNodeId == edge.childNodeId) >= 0) ||
      (this.edgeList.findIndex(e => e.parentNodeId == edge.childNodeId) >= 0 &&
      this.edgeList.findIndex(e => e.childNodeId == edge.parentNodeId) >= 0);
    return exist;
  }

  public getLineCoordinates(): any[] {
    let coordinates: any[] = [];
    let coordinateFrom: any[];
    let coordinateTo: any[];
    let node: any;
    let add: boolean;
    this.edgeList
      .filter(edge => !edge.isFiltered)
      .forEach(edge => {
        coordinateFrom = [];
        coordinateTo = [];
        add = true;
        node = this.nodeDataService.getNodeGraphData(edge.fromNodeId);
        coordinateFrom = L.latLng(node.lat, node.lon);
        add = (node.lat && node.lon) ? true : false;
        node = this.nodeDataService.getNodeGraphData(edge.toNodeId);
        coordinateTo = L.latLng(node.lat, node.lon);
        add = add && (node.lat && node.lon) ? true : false;
        if (add)
          coordinates.push([coordinateFrom, coordinateTo]);
      });

    return coordinates;
  }

  private deselectedNodes(nodeList: any[]): void {
    if (this.edgeList.length > 0 && nodeList.length > 0) {
      nodeList.map(node => node.id)
        .forEach(nodeId => {
          this.edgeList = this.edgeList.filter(edge => {
            return edge.parentNodeId != nodeId && edge.childNodeId != nodeId
          });
        });

      this.edgeListObservable.next(this.edgeList);
    }
  }
}
