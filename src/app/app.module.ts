import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {RouterModule} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import {ComponentsModule} from "./components/components.module";
import {BusService} from "./services/connection/bus.service";
import {MaterialModule} from "@angular/material";
import {DashboardRoutingModule} from "./modules/dashboard/dashboard-routing.module";
import { NavigatorComponent } from './modules/navigator/navigator.component';
import {DashboardModule} from "./modules/dashboard/dashboard.module";

@NgModule({
  declarations: [
    AppComponent,
    NavigatorComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    ComponentsModule,
    DashboardRoutingModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([], { useHash: true }),
  ],
  providers: [BusService],
  bootstrap: [AppComponent]
})
export class AppModule { }
