import { Injectable } from '@angular/core';
import {SecurityService} from "./security.service";
import {Router, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {AsyncSubject} from "rxjs";

@Injectable()
export class AuthGuardService {

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) { }

  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.securityService.validateSession();
    return this.securityService.sessionIsValid
      .do(
        isValid => {
          this.securityService.sessionIsValid = new AsyncSubject<boolean>();
          if (!isValid)
            this.router.navigate(['login'])
        },
        error =>
          console.log(error)
      )
  }
}
