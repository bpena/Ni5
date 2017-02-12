import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DropdownValue} from "../../../components/dropdown/dropdownValue";
import {NodeDataService} from "../../../services/nodes/node-data.service";
import {Http, Headers, ResponseContentType, RequestOptions, Response} from "@angular/http";
import {EdgeService} from "../../../services/edges/edge.service";
import {AlertService} from "../../../components/alert/alert.service";
import {Edge} from "../../../services/edges/edge";
import {Node} from "../../../services/nodes/node";
import {Observable} from "rxjs";

declare var L: any;

@Component({
  selector: 'map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.css'],
  host: {
    'class': 'column-flex',
    'style': 'overflow: hidden'
  },
  encapsulation: ViewEncapsulation.None
})
export class MapDisplayComponent implements OnInit {

  private selectMode: string; // 'single' or 'multi'
  private map: any;
  private markerList: any[];
  private showNodeLabel: boolean = false;
  private polyline: any;

  private menuOptions: DropdownValue[] = [
    {value:1, label:'Isolate selection', method:this.isolateSelection, type:'item', param: this, toggle: false,
      toggleValue: null},
    {value:2, label:'Remove selection', method:this.removeSelection, type:'item', param: this, toggle: false,
      toggleValue: null},
    {value:3, label:'Clear all', method:this.cleanAll, type:'item', param: this, toggle: false, toggleValue: null},
    {value:4, label:null, method:null, type:'separator', param: null, toggle: false, toggleValue: null},
    {value:5, label:'Show nodes label', method:this.toggleShowNodeLabel, type:'item', param: this, toggle: true,
      toggleValue: this.showNodeLabel}
  ];

  constructor(
    private alertService: AlertService,
    private edgeService: EdgeService,
    private http: Http,
    private nodeDataService: NodeDataService
  ) { }

  ngOnInit() {
    this.markerList = [];
    this.selectMode = 'multi';
    this.showNodeLabel = false;

    this.nodeDataService.getSelectedNodes().subscribe(nodeList => {
      this.addMarkers(nodeList);
    });

    this.nodeDataService.getDeselectedNodes().subscribe(nodeList => {
      this.removeMarkers(nodeList);
    });

    this.nodeDataService.getMapFilteredNodes().subscribe(nodeList => {
      this.filter(nodeList);
    });

    this.edgeService.registerEdgeList().subscribe(edgeList => {
      this.updateEdges(edgeList);
    });

    this.edgeService.getFilteredEdgeList().subscribe(edgeList => {
      this.updateEdges(edgeList);
    });
  }

  private filter(nodeList: any[]): void {
    nodeList.forEach(node => {
      this.markerList
        .filter(markerObj => markerObj.id == node.id)
        .forEach(markerObj => {
          if (node.filteredInGraph)
            markerObj.marker._icon.classList.add('filtered');
          else
            markerObj.marker._icon.classList.remove('filtered');
        })
    });
  }

  public ngAfterViewInit(): any {
    this.createView();
  }

  private getImage(nodeObj: any): Observable<any> {
    let iconUrl: string = nodeObj.iconName;
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let options = new RequestOptions({
      responseType: ResponseContentType.Blob,
      headers: headers
    });


    return this.http.get(iconUrl, options)
      .map((res: Response) => {
        return {'node': nodeObj, 'img': res};
      })
      .catch((error: any) => Observable.throw('Server error'));

  }

  private createView(): void {
    this.map = L.map('mapid', {
      zoomControl: false,
      center: L.latLng(50.163634349999995, -118.62540995),
      zoom: 12,
      minZoom: 2,
      maxZoom: 19,
      layers: [],
      closePopupOnClick: false
    });

    L.control.zoom({ position: "topleft"}).addTo(this.map);

    L.tileLayer('https://api.mapbox.com/styles/v1/bpena/ciqzu356n0009bmm60n45lvha/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnBlbmEiLCJhIjoiY2lxenRkY3g0MDJtZGZ2bThwc2NmNTNjaiJ9.N_l9a7-MZUFgq6VB-26erw')
      .addTo(this.map);
  }

  private addMarkers(nodeList: any[]): void {
    let nodeGraph;
    let marker;
    let model = this;

    nodeList.forEach(node => {
      nodeGraph = this.nodeDataService.getNodeGraphData(node.id);
      if (!nodeGraph.lat || !nodeGraph.lon) {
        this.alertService.showMessage("mensaje");
        console.info("Node no provide Longitute or Latitude values.");
      }
      else if(!nodeGraph.isFiltered) {
        this.getImage(nodeGraph).subscribe(
          node => {
            let _nodeGraph = node.node;
            let image = node.img;
            let img = document.createElement("img");
            window.URL.createObjectURL(image.blob());
            let reader = new FileReader();
            reader.onload = function () {
              img.src = reader.result;
              let myIcon = L.icon({
                iconUrl: _nodeGraph.iconName,
                iconSize: [img.height, img.height],
                iconAnchor: [img.height / 2, img.height - 1],
                popupAnchor: [0, -img.height]
              });
              marker = L.marker([_nodeGraph.lat, _nodeGraph.lon], { icon: myIcon });
              marker.bindPopup(model.generateTooltipData(_nodeGraph));
              marker.on('click', event => {model.onClick(event, model);});
              marker.bindTooltip(nodeGraph.labelData, {permanent: true, direction: 'bottom'});
              marker.addTo(model.map);
              if (!model.showNodeLabel)
                marker.closeTooltip();
              marker.selected = false;
              model.markerList.push({id: _nodeGraph.id, marker: marker});
              model.fitMapToMarkers();
            };
            reader.readAsDataURL(image.blob());
          },
          err => {
            console.log(err);
          });
      }
    });

    this.fitMapToMarkers();
  }

  private removeMarkers(nodeList: any[]): void {
    let marker;
    let pos;
    nodeList.forEach(node => {
      this.markerList.filter((markerObj, index) => {
        if (markerObj.id == node.id) {
          pos = index;
          marker = markerObj.marker;
          return true;
        }
        return false;
      });

      if (marker) {
        marker.removeFrom(this.map);
        this.markerList.splice(pos, 1);
      }
    });

    this.fitMapToMarkers();
  }

  private fitMapToMarkers(): void {
    let group;
    let markerList = [];
    let bounds;

    this.markerList.forEach(markerObj => {
      markerList.push(markerObj.marker);
    });

    if(markerList.length > 0) {
      group = L.featureGroup(markerList);
      bounds = group.getBounds();
      bounds._northEast.lat += 1;
      bounds._northEast.lng += 1;
      bounds._southWest.lat -= 1;
      bounds._southWest.lng -= 1;
      this.map.fitBounds(bounds);
      try {
        this.map.setView(bounds.getCenter(), this.map.getZoom());
      }
      catch (e) {
        console.log(e);
      }

      setTimeout(() => {
        this.map.invalidateSize()
      }, 400);
    }
  }

  private cleanAll(_this: any): void {
    let nodeIds =_this.markerList.forEach(nodeData => nodeData.id);
    if (nodeIds.length > 0) {
      _this.nodeDataService.collapseNodes(nodeIds);
      _this.nodeDataService.deselectNodes(nodeIds);
    }
  }

  private removeSelection(_this: any): void {
    let nodeIds: number[] = [];
    _this.markerList
      .filter(marker => {return marker.marker.selected;})
      .forEach(marker => { nodeIds.push(marker.id); });

    if (nodeIds.length > 0) {
      _this.nodeDataService.collapseNodes(nodeIds);
      _this.nodeDataService.deselectNodes(nodeIds);
    }
  }

  private isolateSelection(_this: any): void {
    let nodeIds: number[] = [];
    _this.markerList
      .filter(marker => {return !marker.marker.selected;})
      .forEach(marker => { nodeIds.push(marker.id); });

    if (nodeIds.length > 0) {
      _this.nodeDataService.collapseNodes(nodeIds);
      _this.nodeDataService.deselectNodes(nodeIds);
    }
  }

  private toggleShowNodeLabel(_this: any, value: boolean): void {
    _this.showNodeLabel = value;
    _this.markerList.forEach(markerObj => {
      markerObj.marker.toggleTooltip();
    });
  }

  private unselectMarkers(selectedMarker): void {
    this.markerList.forEach(markerObj => {
      if (markerObj.marker.selected && markerObj.marker !== selectedMarker) {
        markerObj.marker.selected = false;
        markerObj.marker._icon.classList.remove('selectedMarker');
        // marker.marker.setIcon(marker.marker.selected ? this.getHighlightIcon() : this.getDefaultIcon())
      }
    })
  }

  private generateTooltipData(node : Node) : string {
    let tooltipLabel : string;
    let tooltipValue : string;
    let finalTooltip : string;

    finalTooltip = "<ul>";
    node.tooltipData.forEach(data => {
      tooltipLabel = data.label;
      if (data.value) {
        if (data.value.constructor.name === "String") {
          tooltipValue = data.value;
        }
        else if (data.value.constructor.name === "SafeHtmlImpl") {
          tooltipValue = data.value.changingThisBreaksApplicationSecurity;
        }
        else {
          tooltipValue = '';
        }
      }
      else {
        tooltipValue = '';
      }

      finalTooltip += "<li><b>" + tooltipLabel + ":</b>" + tooltipValue + "</li>";
    });
    finalTooltip += "</ul>";

    return finalTooltip;
  }

  private onClick(event: any, mapDisplay : MapDisplayComponent): void {
    let select: boolean = !event.target.selected;
    if (this.selectMode == 'single' || (this.selectMode == 'multi' && !event.originalEvent.ctrlKey))
      this.unselectMarkers(event.target);
    event.target.selected = select;
    if(!select) {
      event.target._icon.classList.remove('selectedMarker');
    }
    else {
      event.target._icon.classList.add('selectedMarker');
    }
  }

  private updateEdges(edgeList: Edge[]) : void {
    if (this.polyline != null)
      this.polyline.removeFrom(this.map);

    if (edgeList.length > 0) {
      let latLngs = this.edgeService.getLineCoordinates();

      var polyline = L.polyline(latLngs, {
        color: '#3095fe',
        weight: 2,
        opacity: 1,
        smoothFactor: 12})
        .addTo(this.map);

      this.polyline = polyline;
    }
  }
}
