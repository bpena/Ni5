import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {BusService} from "../../services/connection/bus.service";
import {SecurityService} from "../../services/security/security.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LoginRoutingModule,
    MaterialModule.forRoot()
  ],
  declarations: [LoginComponent],
  providers: [
    BusService,
    SecurityService
  ]
})
export class LoginModule { }
