import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {SecurityService} from "../../services/security/security.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  host: { 'class': 'login-form column-flex' },
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  private username: string;
  private password: string;
  private errorMsg: string;

  constructor( private securityService: SecurityService ) { }

  private login(): void {
    this.securityService.login(this.username, this.password)
      .subscribe(
        response => {
          if (response.status != 200)
            this.errorMsg = response.message;
        },
        error => {
          this.errorMsg = error.message;
        }
      )
  }

  private cleanErrorMsg(): void {
    this.errorMsg = "";
  }
}
