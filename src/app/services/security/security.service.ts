import { Injectable } from '@angular/core';
import {AsyncSubject, Observable} from "rxjs";
import {Session} from "./session";
import {BusService} from "../connection/bus.service";
import {Router} from "@angular/router";
import {Headers} from "@angular/http";
import {ConnectionConstants} from "../connection/connection.constants";
import {ResponseObj} from "../connection/response.obj";

@Injectable()
export class SecurityService {
  public sessionIsValid: AsyncSubject<boolean> = new AsyncSubject<boolean>();
  public session: Session = {
    userName: null,
    isGuest: true
  };

  constructor(
    private busService: BusService,
    private router: Router
  ) { }

  validateSession() : void {
    let url = '/Ni3Web/api/1.00/security/session/validate';
    let headers = new Headers();
    let sessionId = localStorage.getItem(ConnectionConstants.SESSION_NAME);
    if (sessionId && (this.session == null || this.session.isGuest)) {
      headers.append('Content-Type', 'application/json');

      this.busService.get(url)
        .subscribe(
          response => {
            this.processSessionResponse(response);
          },
          error => {
            this.processSessionResponse(error);
          },
          () => {
          }
        )
    }
    else {
      if (sessionId && !this.session.isGuest)
        this.sessionIsValid.next(true);
      else
        this.sessionIsValid.next(false);
      this.sessionIsValid.complete();
    }
  }

  public login(username, password) : Observable<ResponseObj> {
    let observable : Observable<ResponseObj>;
    let url = '/Ni3Web/api/1.00/security/user/login';
    let body = "";
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('username', username);
    headers.append('password', password);

    observable = this.busService.post(url, body, {headers})
      .map(response => {return response;})
      .share();

    observable
      .subscribe(
        response => {
          this.processLoginResponse(response);
        },
        error => {
          console.log("error on login", error);
        }
      );

    return observable;
  }

  public logout(): void {
    let url = '/Ni3Web/api/1.00/security/user/logout';
    let body = "";
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.busService.get(url, {headers})
      .subscribe(
        response => {
          this.processLogoutResponse(response);
        },
        error => {
          console.log("error on logout", error);
        }
      );
  }

  private processSessionResponse(response: ResponseObj): void {
    let username: string;
    if (response.value && response.value.isValid && response.value.name)
      username = response.value.name;

    if (response.value && response.value.isValid)
      this.sessionIsValid.next(true);
    else
      this.sessionIsValid.next(false);
    this.sessionIsValid.complete();

    this.updateSession(username);
  }

  private processLoginResponse(response: ResponseObj) {
    let username : string;

    if (response.status == 200) {
      username = response.value;
      this.saveSessionId(response.session);
    }

    this.updateSession(username);

    if (response.status == 200)
      this.router.navigate(['search']);
  }

  private processLogoutResponse(response: ResponseObj) {
    let username : string = null;

    if (response.status == 200 || response.status == 401 || response.status == 403) {
      this.deleteSessionId();
      this.router.navigate(['login']);
    }

    this.updateSession(username);
  }

  private saveSessionId(sessionId: string): void {
    if (sessionId != null)
      localStorage.setItem(ConnectionConstants.SESSION_NAME, sessionId);
  }

  private deleteSessionId(): void {
    localStorage.removeItem(ConnectionConstants.SESSION_NAME);
  }

  private updateSession(user: string) : void {
    this.session.isGuest = user == null;
    this.session.userName = user;
  }
}
