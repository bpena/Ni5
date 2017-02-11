import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {BusService} from "./bus.service";
import {ResponseObj} from "./response.obj";
import {Headers, URLSearchParams} from "@angular/http";

@Injectable()
export class SchemaService {
  private currentSchemaId: number;
  private currentMetadata: Object;
  private currentSchemaObservable: BehaviorSubject<number>;
  private currentData: any;
  private currentDataObservable: BehaviorSubject<any>;
  private currentMetadataObservable: BehaviorSubject<any>;

  constructor( private busService: BusService ) {
    this.currentMetadata = null;
    this.currentSchemaObservable = new BehaviorSubject(null);
    this.currentDataObservable = new BehaviorSubject(null);
    this.currentMetadataObservable = new BehaviorSubject(null);
  }

  public getSchemaList(): Observable<ResponseObj> {
    let url = '/Ni3Web/api/1.00/schema/list';
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.busService.get(url, {headers: headers});
  }

  public getPrefilterData(schemaId: number): Observable<ResponseObj> {
    let url = '/Ni3Web/api/1.00/schema/' + schemaId.toString() + '/prefilterdata';
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.busService.get(url, {headers: headers});
  }

  public getSchemaData(schemaId: number): Observable<ResponseObj> {
    let url = '/Ni3Web/api/1.00/schema/data';
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // Parameters obj-
    let params: URLSearchParams = new URLSearchParams();
    params.set('schemaId', schemaId.toString());

    return this.busService.get(url, {headers: headers, search: params});
  }

  public setCurrentSchema(schemaId:number) {
    this.currentSchemaId = schemaId;
    this.currentSchemaObservable.next(this.currentSchemaId);
  }

  public getCurrentSchema(): BehaviorSubject<number> {
    return this.currentSchemaObservable;
  }

  public setMetadata(newMetadata : Object) {

    this.currentMetadata = newMetadata;
    this.currentMetadataObservable.next(this.currentMetadata);
  }

  public getMetadata() : BehaviorSubject<any[]> {
    return  this.currentMetadataObservable;
  }

  public getCurrentData(): BehaviorSubject<any> {
    return this.currentDataObservable;
  }

  public setCurrentData(attributes:any, element:any) {
    this.currentData = {
      attributes: attributes,
      element: element
    };
    this.currentDataObservable.next(this.currentData);
  }
}
