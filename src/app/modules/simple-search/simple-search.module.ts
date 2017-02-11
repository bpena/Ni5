import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SimpleSearchComponent} from "./simple-search.component";
import {MaterialModule} from "@angular/material";
import {BusService} from "../../services/connection/bus.service";
import {NodeService} from "../../services/nodes/node.service";
import {NodeDataService} from "../../services/nodes/node-data.service";
import {SecurityService} from "../../services/security/security.service";
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule.forRoot()
  ],
  declarations: [SimpleSearchComponent],
  providers: [
    BusService,
    NodeService,
    NodeDataService,
    SecurityService
  ]
})
export class SimpleSearchModule { }
