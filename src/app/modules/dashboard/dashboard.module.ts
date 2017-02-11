import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import {ComponentsModule} from "../../components/components.module";
import {MaterialModule} from "@angular/material";
import {RouterModule} from "@angular/router";
import {UiService} from "../../services/ui.service";
import {AuthGuardService} from "../../services/security/authGuard.service";
import {NavigatorModule} from "../navigator/navigator.module";

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    MaterialModule.forRoot(),
    NavigatorModule,
    RouterModule
  ],
  exports: [DashboardComponent],
  declarations: [DashboardComponent],
  providers: [
    AuthGuardService,
    UiService
  ]
})
export class DashboardModule { }
