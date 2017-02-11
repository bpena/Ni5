import {Component, OnInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UiService} from "../../services/ui.service";
import {SchemaService} from "../../services/connection/schema.service";
import {NavigatorService} from "./navigator.service";
import {NodeDataService} from "../../services/nodes/node-data.service";

@Component({
  selector: 'ni5-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css'],
  host: { 'class': 'column-flex' },
  encapsulation: ViewEncapsulation.None
})
export class NavigatorComponent implements OnInit, OnDestroy {
  private view:number;
  private showMap:boolean;
  private showGraph:boolean;
  private showList:boolean;
  private showDetail:boolean;
  private activated:boolean;
  private initialized:boolean;


  constructor(
    private route: ActivatedRoute,
    private uiService: UiService,
    private schemaService: SchemaService,
    private navigatorService: NavigatorService,
    private nodeDataService: NodeDataService
  ) { }

  ngOnInit() {
    this.activated = false;
    this.updateView(2);
    this.initialized = false;

    this.uiService.setShowToolbarFilter(true);

    this.navigatorService.register().subscribe(value => {
      this.updateView(value);
    });

    this.route.params.subscribe(params => {
      this.activated = false;
      this.updateView(2);
    });

    this.schemaService.getCurrentData()
      .subscribe(data => {
        if (data && data.attributes && data.element) {
          this.view |= 1;
          this.updateView(this.view);
          this.navigatorService.setNavigatorView(this.view);
        }
        else {
          let aux = this.view;
          this.view &= 2;
          if (aux != this.view) {
            this.updateView(this.view);
            this.navigatorService.setNavigatorView((this.view));
          }
        }
      })

    this.nodeDataService.getSelectedNodes().subscribe(nodeList => {
      if (!this.activated && nodeList.length > 0) {
        this.view |= this.view < 4 ? 12 : 0;
        this.updateView(this.view);
        this.navigatorService.setNavigatorView(this.view);
      }
      else if (!this.activated) {
        this.view |= 2;
        this.navigatorService.setNavigatorView(this.view);
      }
    })
  }

  public ngOnDestroy(): any {
    this.nodeDataService.reset();
    this.activated = false;
    this.view = 2;
    this.updateView(this.view);
    this.navigatorService.setNavigatorView(this.view);
  }

  private updateView(value:number):void {
    this.view = value;
    this.showMap = (this.view & 8) > 0;
    this.showGraph = (this.view & 4) > 0;
    this.showList = (this.view & 2) > 0;
    this.showDetail = (this.view & 1) > 0;
    this.initialized = true;
  }

  visi: boolean = false;
  objeto: any = {'nombre': 'prueba'};

  private setVisible(): void {
    this.visi = true;
  }

  private onOk(evt:any): void {
    this.visi = false;
    console.log('onOk');
  }

  private onCancel(evt:any): void {
    this.visi = false;
    console.log('onCancel');
  }

  private onClean(evt:any): void {
    this.objeto.nombre = '';
  }
}
