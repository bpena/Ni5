import { Injectable } from '@angular/core';
import {Subject, Observable} from "rxjs";
import {BusService} from "./bus.service";
import {SchemaService} from "./schema.service";
import {Headers} from "@angular/http";
import {ResponseObj} from "./response.obj";

@Injectable()
export class SearchService {
  public schema: number;
  public criteria: string;
  public schemaObservable: Subject<number>;
  public criteriaObservable: Subject<string>;

  constructor(
    private busService: BusService,
    private schemaService:SchemaService
  ) {
    this.schemaObservable = new Subject<number>();
    this.criteriaObservable = new Subject<string>();
  }

  public getCriteria(): Subject<string> {
    return this.criteriaObservable;
  }

  public getCriteriaValue(): string {
    return this.criteria;
  }

  public getList(criteria: string, schema: number): Observable<ResponseObj> {
    let url = '/Ni3Web/api/1.00/search/simple';
    let body = '';
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('searchText', criteria);
    headers.append('schema', schema.toString());

    this.schema = schema;
    this.criteria = criteria;
    this.criteriaObservable.next(criteria);

    this.schemaService.setCurrentSchema(this.schema);

    return this.busService.post(url, body, {headers: headers});
  }

  public getNodeData(nodeIds: number[], schemaId: number) : Observable<ResponseObj> {
    let url = '/Ni3Web/api/1.00/graph/nodes?schemaId=' + schemaId;
    let body = {
      nodeIds : nodeIds
    };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.busService.post(url, body, {headers: headers});
  }

  public getNodeDataForList(nodeIds: number[], schemaId : number) : Observable<ResponseObj> {
    let url = '/Ni3Web/api/1.00/search/node/data?schemaId=' + schemaId;
    let body = {
      nodeIds : nodeIds
    };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.busService.post(url, body, {headers: headers});
  }
}
