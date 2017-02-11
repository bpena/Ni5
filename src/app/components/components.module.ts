import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AlertComponent} from "./alert/alert.component";
import {SpinnerComponent} from "./spinner/spinner.component";
import {ContextMenuComponent} from "./contextMenu/contextMenu.component";
import {GridComponent} from "./grid/grid.component";
import {PanelComponent} from "./panel/panel.component";
import {KeysPipe} from "./pipes/keys.pipe";
import {SchemaSelectorComponent} from "./schema/schemaSelector.component";
import {SearchComponent} from "./search/search.component";
import {AlertService} from "./alert/alert.service";
import {SchemaService} from "../services/connection/schema.service";
import {SearchService} from "../services/connection/search.service";
import {MaterialModule} from "@angular/material";
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule.forRoot()
  ],
  exports: [
    AlertComponent,
    ContextMenuComponent,
    GridComponent,
    KeysPipe,
    PanelComponent,
    SchemaSelectorComponent,
    SearchComponent,
    SpinnerComponent
  ],
  declarations: [
    AlertComponent,
    SpinnerComponent,
    ContextMenuComponent,
    GridComponent,
    PanelComponent,
    KeysPipe,
    SchemaSelectorComponent,
    SearchComponent
  ],
  providers: [
    AlertService,
    SchemaService,
    SearchService
  ]
})
export class ComponentsModule { }
