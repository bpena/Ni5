import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Http, RequestOptionsArgs, Headers, Response} from "@angular/http";
import {} from "./connection.constants";
import {ConnectionConstants} from "./connection.constants";
import {ResponseObj} from "./response.obj";

@Injectable()
export class BusService {

  public loading: BehaviorSubject<boolean>;
  private counterConn: number;

  constructor( private http: Http ) {
    this.counterConn = 0;
    this.loading = new BehaviorSubject(false);
  }

  private addSession2Headers(options: RequestOptionsArgs): RequestOptionsArgs {
    let sessionId: string;

    if (options == null) {
      let headers: Headers = new Headers();
      headers.append('Content-Type', 'application/json');
      options = {headers};
    }

    sessionId = localStorage.getItem(ConnectionConstants.SESSION_NAME);

    if (sessionId != null)
      options.headers.append("session", sessionId);
    else if (options.headers.get("session") != null)
      options.headers.delete("session");

    return options;
  }

  public get(url:string, options?: RequestOptionsArgs) : Observable<ResponseObj> {
    return Observable.create(observer => {
      this.increaseCounterConn();
      options = this.addSession2Headers(options);
      options.body = options.body || "";
      this.http.get(url, options)
        .subscribe(
          response => {
            observer.next(this.proccess(response));
          },
          error => {
            observer.next(this.proccess(error));
          },
          () => {
          }
        )
    })
  }

  public post(url:string, body: any, options?: RequestOptionsArgs) : Observable<ResponseObj> {
    return Observable.create(observer => {
      this.increaseCounterConn();
      options = this.addSession2Headers(options);
      this.http.post(url, body, options)
        .subscribe(
          response => {
            observer.next(this.proccess(response));
          },
          error => {
            observer.next(this.proccess(error));
          },
          () => {
          }
        )
    });
  }

  private proccess(response: Response) : ResponseObj {
    let responseObj: ResponseObj = new ResponseObj();
    responseObj.status = response.status;
    responseObj.session = response.headers.get("session");
    responseObj.message = response.headers.get("message");
    responseObj.value = null;
    if (response.url != "http://localhost:8080/Ni3Web/api/1.00/security/user/logout" && response.status == 200)
      responseObj.value = response.json();

    this.decreaseCounterConn();
    return responseObj;
  }

  private increaseCounterConn() : void {
    this.counterConn++;
    if (this.counterConn == 1) {
      this.loading.next(true);
    }
  }

  private decreaseCounterConn() : void {
    this.counterConn--;
    if (this.counterConn == 0) {
      this.loading.next(false);
    }
  }

}
