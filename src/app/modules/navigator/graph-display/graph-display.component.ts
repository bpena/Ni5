import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DropdownValue} from "../../../components/dropdown/dropdownValue";
import {EdgeService} from "../../../services/edges/edge.service";
import {NodeDataService} from "../../../services/nodes/node-data.service";
import {SchemaService} from "../../../services/connection/schema.service";
import {SearchService} from "../../../services/connection/search.service";
import {Edge} from "../../../services/edges/edge";

@Component({
  selector: 'graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.css'],
  host: { 'class': 'column-flex' },
  encapsulation: ViewEncapsulation.None
})
export class GraphDisplayComponent implements OnInit {
  private schemaId            : number;
  private showNodeLabel       : boolean = false;
  private showEdgeLabel       : boolean = false;
  private showEdgeCount       : boolean = true;
  private showEdgeArrow       : boolean = false;
  private tree                : number[][] = [];
  private nodes               : any[] = [];
  private links               : any[] = [];
  private temporalEdges       : any[] = [];
  private nodeLabelClass      : string = "hide-node-label";
  private edgeCountClass      : string = "";
  private edgeArrowClass      : string = "hide-edge-arrow";
  private graphClass          : string[] = [
    this.nodeLabelClass,
    this.edgeArrowClass,
    this.edgeCountClass
  ];

  menuOptions: DropdownValue[] = [
    {value:1, label:'Isolate selection', method:this.isolateNodes, type:'item', param: this, toggle: false,
      toggleValue: null},
    {value:2, label:'Remove selection', method:this.removeSelection, type:'item', param: this, toggle: false,
      toggleValue: null},
    {value:3, label:'Clear all', method:this.cleanAll, type:'item', param:this, toggle:false, toggleValue: null},
    {value:4, label:null, method:null, type:'separator', param: null, toggle: false, toggleValue: null},
    {value:5, label:'Show nodes label', method: this.toggleShowNodeLabel, type:'item', param:this, toggle:true,
      toggleValue: this.showNodeLabel},
    {value:7, label:'Show directed graph', method:this.toggleEdgeArrow, type:'item', param:this, toggle:true,
      toggleValue: this.showEdgeArrow},
    {value:9, label:'Show edge count', method:this.toggleShowEdgeCount, type:'item', param:this, toggle:true,
      toggleValue: this.showEdgeCount}
  ];

  constructor(
    private edgeService: EdgeService,
    private nodeDataService: NodeDataService,
    private schemaService: SchemaService,
    private searchService: SearchService
  ) { }

  ngOnInit() {

    this.schemaService.getCurrentSchema()
      .subscribe(value => { this.schemaId = value; });

    this.nodeDataService.getSelectedNodes().subscribe(nodeList => {
      if (nodeList.length > 0)
        this.addNodes(nodeList);
    });

    this.nodeDataService.getDeselectedNodes().subscribe(nodeList => {
      if (nodeList.length > 0)
        this.removeNodes(nodeList);
    });

    this.nodeDataService.getFilteredNodes().subscribe(nodeList => {
      if (nodeList.length > 0)
        this.filterNodes(nodeList);
    });
  }

  private addNodes(nodeList: any[]): void {
    let nodesId: any[] = [];
    let nodesGraphData: any[] = [];

    nodeList.forEach(node => {
      nodesGraphData.push(this.nodeDataService.getNodeGraphData(node.id));
      nodesId.push(node.id);
    });

    this.searchService.getNodeData(nodesId, this.schemaId).subscribe(response => {
      response.value.forEach(node => {
        let i = nodesGraphData.findIndex(nodeGraph => nodeGraph.id == node.id);
        if (i >= 0) nodesGraphData[i]["edgeCount"] = node.edgeCount;

      });

      let nodes: any[] = [].concat(this.nodes);
      let links: any[] = [];

      nodesGraphData.forEach(nodeGraph => {
        nodes.push({
          id: nodeGraph.id,
          labelData: nodeGraph.labelData,
          edgeCount: nodeGraph.edgeCount,
          icon: nodeGraph.iconName,
          expanded: nodeGraph.isExpanded,
          selected: false,
          filtered: nodeGraph.isFiltered,
          filteredInGraph: nodeGraph.isFiltered,
          group: 0
        });
      });

      this.temporalEdges
        .forEach(link => {
          nodes
            .filter(node => {
              return node.id == link.source || node.id == link.target;
            })
            .forEach(node => {
              node.edgeCount--;
            });
        });

      this.nodes = nodes;

      if (this.temporalEdges.length > 0) {
        this.links = this.temporalEdges.concat(this.links);
        this.temporalEdges = [];
      }

      nodeList
        .filter(node => node.isExpanded)
        .forEach(node => this.expandNode(node.id));
    });
  }

  private getChildren(nodeId: number, clean?: boolean): number[] {
    let children: number[];
    let nietos: number[] = [];
    let aux: number[];

    children = this.tree[nodeId] || [];
    children.forEach(childId => {
      aux = this.getChildren(childId, clean);
      nietos = nietos.concat(aux);
    });

    if (clean)
      this.tree[nodeId] = undefined;

    return children.concat(nietos);
  }

  private getChildrenFromList(nodesId: number[]): number[] {
    let children: number[] = [];
    let aux: number[];

    nodesId.forEach(nodeId => {
      aux = this.getChildren(nodeId, true);
      children = children.concat(aux);
    });

    return children;
  }

  private removeNodes(nodeList: any[]): void {
    let nodesId: any[] = [];
    let nodes: any[];
    let links: any[];

    nodeList.forEach(node => { nodesId.push(node.id); });

    links = this.links.filter(filter => {
      return nodesId.indexOf(filter.target.id) == -1 && nodesId.indexOf(filter.source.id) == -1;
    });

    nodes = this.nodes.filter(node => {
      return nodesId.indexOf(node.id) == -1;
    });


    this.links
      .filter(filter => {
        return (nodesId.indexOf(filter.target.id) != -1 || nodesId.indexOf(filter.source.id) != -1); //&&
//                    nodes.filter(node => {return node.id != filter.target.id && node.id != filter.source.id; }).length == 0;
      })
      .forEach(link => {
        nodes
          .filter(node => {
            return node.id == link.source.id || node.id == link.target.id;
          })
          .forEach(node => {
            node.expanded = false;
            node.edgeCount++;
          });
      });

    this.nodes = nodes;
    this.links = links;

    let children = this.getChildrenFromList(nodesId);
    this.nodeDataService.deselectNodes(children);
  }

  private filterNodes(nodeList: any[]): void {
    let nodesToAdd = nodeList.filter(node => this.nodes.findIndex(graphNode => graphNode.id == node.id) == -1);
    if (nodesToAdd.length > 0)
      this.addNodes(nodesToAdd);

    nodeList.forEach(node => {
      this.nodes
        .filter(nodeGraph => {return node.id == nodeGraph.id})
        .forEach(nodeGraph => nodeGraph.filtered = node.isFiltered);
      this.updateFilterNodes(node.id, false);
    });

    this.nodes = [].concat(this.nodes);

    this.nodeDataService.setMapFilteredNodes(this.nodes);

    this.filterEdges();
  }

  private updateFilterNodes(nodeId: number, parentIsFiltered: boolean): void {
    let children = this.tree[nodeId] || [];
    this.nodes
      .filter(nodeGraph => {return nodeGraph.id == nodeId})
      .forEach(nodeGraph => {
        nodeGraph.filteredInGraph = parentIsFiltered || nodeGraph.filtered;
        parentIsFiltered = nodeGraph.filteredInGraph;
      });
    children.forEach(childId => {
      this.updateFilterNodes(childId, parentIsFiltered);
    });
  }

  private filterEdges(): void {
    let sourceNode: any;
    let targetNode: any;
    this.links.forEach(link => {
      sourceNode = this.nodes.filter(node => {return node.id == link.source;})[0];
      targetNode = this.nodes.filter(node => {return node.id == link.target;})[0];
      link.filtered = link.source.filteredInGraph || link.target.filteredInGraph;
    });

    this.links = [].concat(this.links);
  }

  private isolateNodes(_this:any): void {
    let toRemove = _this.nodes.filter(node => !node.isFiltered)
      .map(node => node.id);

    _this.nodeDataService.collapseNodes(toRemove);
    _this.nodeDataService.deselectNodes(toRemove);
  }

  private removeSelection(_this:any): void {
    let toRemove = _this.nodes.filter(node => node.isFiltered)
      .map(node => node.id);

    _this.nodeDataService.collapseNodes(toRemove);
    _this.nodeDataService.deselectNodes(toRemove);
  }

  private cleanAll(_this:any): void {
    let nodeIds = _this.nodes.map(node => node.id);
    if (nodeIds.length > 0) {
      _this.nodeDataService.collapseNodes(nodeIds);
      _this.nodeDataService.deselectNodes(nodeIds);
    }
  }

  private toggleShowNodeLabel(_this: any): void {
    _this.showNodeLabel = !_this.showNodeLabel;
    _this.graphClass[0] = _this.showNodeLabel ? '' : 'hide-node-label';
  }

  private toggleEdgeArrow(_this:any): void {
    _this.showEdgeArrow = !_this.showEdgeArrow;
    _this.graphClass[1] = _this.showEdgeArrow ? '' : 'hide-edge-arrow';
  }

  private toggleShowEdgeCount(_this:any): void {
    _this.showEdgeCount = !_this.showEdgeCount;
    _this.graphClass[2] = _this.showEdgeCount ? '' : 'hide-edge-count';
  }

  private expandNode(nodeId: any): void {
    let newEdges: Edge[] = [];
    this.nodeDataService.expandNode(nodeId);
    this.searchService.getNodeDataForList([nodeId], this.schemaId).subscribe(response => {
      let nodeData = response.value.graphData[nodeId];
      let nodes: any[] = [];
      let targetId: number;
      for (let edge of nodeData.edges) {
        targetId = (edge.toNode.id == nodeId) ? edge.fromNode.id : edge.toNode.id;
        if (this.nodes.findIndex((node: any) => {return targetId == node.id}) == -1)
          nodes.push(nodeData.nodesData[targetId]);
        this.temporalEdges.push({
          "source": edge.fromNode.id,
          "target": edge.toNode.id,
          "value": 8,
          "filtered": false,
          "directed": edge.directed != 0
        });

        newEdges.push({
          parentNodeId: nodeId,
          childNodeId: targetId,
          fromNodeId: edge.fromNode.id,
          toNodeId: edge.toNode.id,
          isFiltered: false,
          showArrow: false,
          id: null
        });
      }

      this.temporalEdges = this.temporalEdges
        .filter(edge => {
          return this.links.findIndex(link => {return link.source.id == edge.source && link.target.id == edge.target; }) == -1;
        });

      if (nodes.length > 0) {
        if (this.tree[nodeId] == null)
          this.tree[nodeId] = [];

        nodes.forEach(node => {
          if (this.tree[nodeId].indexOf(node.id) == -1)
            this.tree[nodeId].push(node.id);
        });
        this.nodeDataService.addNodes(nodes);
      }

      this.edgeService.addEdges(newEdges);

      if (nodeData.edges.length > 0 && nodes.length == 0) {

        this.temporalEdges
          .forEach(link => {
            this.nodes
              .filter(node => {
                return node.id == link.source || node.id == link.target;
              })
              .forEach(node => {
                node.edgeCount--;
              });
          });

        this.nodes = [].concat(this.nodes);

        this.links = this.links.concat(this.temporalEdges);
        this.temporalEdges = [];
      }
    });
  }

  private collapseNode(nodeId: number) {
    if (this.tree[nodeId] && this.tree[nodeId].length > 0) {
      this.nodeDataService.collapseNode(nodeId);
      this.nodeDataService.deselectNodes(this.tree[nodeId]);
    }
  }

  private onClicked(event: any): void {
    if (!event.ctrlKey)
      this.nodes.filter(node => node.isFiltered)
        .forEach(node => node.isFiltered = false);

    this.nodes.filter(node => node.id == event.nodeId)
      .forEach(node => node.isFiltered = !node.isFiltered);
  }
}
