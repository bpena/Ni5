import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailDisplayComponent } from './detail-display/detail-display.component';
import { FilterComponent } from './filter/filter.component';
import { GraphDisplayComponent } from './graph-display/graph-display.component';
import { ListDisplayComponent } from './list-display/list-display.component';
import { MapDisplayComponent } from './map-display/map-display.component';
import { NavigatorButtonsComponent } from './navigator-buttons/navigator-buttons.component';
import { GraphComponent } from './graph-display/graph/graph.component';
import {ComponentsModule} from "../../components/components.module";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {NavigatorComponent} from "./navigator.component";
import {AlertService} from "../../components/alert/alert.service";
import {BusService} from "../../services/connection/bus.service";
import {EdgeService} from "../../services/edges/edge.service";
import {NodeService} from "../../services/nodes/node.service";
import {NodeDataService} from "../../services/nodes/node-data.service";
import {SecurityService} from "../../services/security/security.service";
import {FilterService} from "./filter/filter.service";
import {NavigatorService} from "./navigator.service";
import {CandTLeafletComponent, CandTLeafletService} from "angular2.leaflet.components";

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    MaterialModule.forRoot()
  ],
  declarations: [
    CandTLeafletComponent,
    DetailDisplayComponent,
    FilterComponent,
    GraphDisplayComponent,
    ListDisplayComponent,
    MapDisplayComponent,
    NavigatorButtonsComponent,
    NavigatorComponent,
    GraphComponent
  ],
  providers: [
    AlertService,
    BusService,
    CandTLeafletService,
    EdgeService,
    NodeService,
    NodeDataService,
    SecurityService,
    FilterService,
    NavigatorService
  ],
  exports: [
    FilterComponent,
    NavigatorButtonsComponent,
    NavigatorComponent
  ]
})
export class NavigatorModule { }
