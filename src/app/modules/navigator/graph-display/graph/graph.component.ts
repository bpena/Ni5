import {
  Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ElementRef,
  SimpleChange, OnChanges, AfterViewChecked
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'graph-component',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
  host: { 'class': 'column-flex' },
  encapsulation: ViewEncapsulation.None
})
export class GraphComponent implements OnChanges, AfterViewChecked {
  @Input() nodes: any[];
  @Input() links: any[];
  @Output() expandNode: EventEmitter<number> = new EventEmitter();
  @Output() collapseNode: EventEmitter<number> = new EventEmitter();
  @Output() clicked: EventEmitter<number> = new EventEmitter();
  private svg: any;
  private g: any;
  private initialized: boolean = false;
  private parentNativeElement: any;
  private simulation: any;
  private nodeGroup: any;
  private node: any;
  private nodeEnter: any;
  private linkGroup: any;
  private link: any;
  private container: any;

  constructor( private element: ElementRef ) {
    this.parentNativeElement = element.nativeElement;
  }

  ngAfterViewChecked() {
    if (this.parentNativeElement.offsetWidth > 0 && !this.initialized) {
      this.initialize();
      this.initialized = true;
    }
  }

  ngOnChanges(changes:  { [propName: string]: SimpleChange }) {
    if (this.initialized)
      this.restart(this);
  }

  private initialize(): void {
    let _this = this;
    let d3ParentElement = d3.select(this.parentNativeElement);
    let svg = d3ParentElement.select<SVGSVGElement>('svg');
    let width = this.parentNativeElement.offsetWidth;
    let height = this.parentNativeElement.offsetHeight - 30;

    this.simulation = d3.forceSimulation(this.nodes)
      .force("link", d3.forceLink().strength(1).distance(40).id((d: any) => { return d.id; }))
      .force("collide",d3.forceCollide(40))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      // .force("y", d3.forceY(width / 2))
      // .force("x", d3.forceX(height / 2))
      .alphaTarget(1);


    // define arrow markers for graph links
    let _zoom = d3.zoom()
      .scaleExtent([1 / 2, 8])
      .on("zoom", zoomed);

    let defs = svg.append('svg:defs');
    defs.append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', "32")
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    // define arrow markers for leading arrow
    defs.append('svg:marker')
      .attr('id', 'mark-end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 7)
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    this.container = svg.append("rect")
      .attr("width", width * 4)
      .attr("height", height * 4)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(_zoom);

    this.svg = svg.append("g");

    var gui = d3.select("#buttons");
    gui.append("div")
      .classed("zoom in", true)
      .text("+")
      .on("click", function() {
        _zoom.scaleBy(_this.container, 1.25);
      });
    gui.append("div")
      .classed("zoom out", true)
      .text("-")
      .on("click", function() {
        _zoom.scaleBy(_this.container, 0.75);
      })

    function zoomed() {
      _this.svg.attr("transform", d3.event.transform);
    }


    this.linkGroup = this.svg.append("g")
      .attr("class", "link");

    this.nodeGroup = this.svg.append("g")
      .attr("class", "nodes");

    this.restart(this);
  }

  public restart(_this: any) {
    var simulation = _this.simulation;

    if (!_this.nodes) _this.nodes = [];
    if (!_this.links) _this.links = [];

    // Update and restart the simulation.
    _this.simulation.nodes(_this.nodes).on("tick", ticked);
    _this.simulation.force("link").links(_this.links);

    // Update Links.
    _this.link = _this.linkGroup
      .selectAll("line")
      .data(_this.links);

    // Enter Links
    let linkEnter = _this.link
      .enter().append("line")
      .attr('d', 'M0,0L0,0');

    // Exit any old links
    _this.link.exit().remove();

    _this.link = linkEnter.merge(_this.link);


    // Update the nodes
    _this.node = _this.nodeGroup
      .selectAll(".node")
      .data(_this.nodes, (d: any) => { return d.id;});

    // Enter any new nodes
    _this.nodeEnter = _this.node.enter().append("g")
      .attr("class", (d: any) => { return "node" + (d.filtered ? "filtered" : ""); })
      .on("mousedown", clicked)
      // .on("click", clicked)
      .on("dblclick", dblclicked)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Exit any old nodes
    _this.node.exit().remove();

    _this.node = _this.nodeEnter.merge(_this.node);

    _this.nodeEnter.append("image")
      .attr("xlink:href", (d: any) => { return d.icon; })
      .attr("x", -12)
      .attr("y", -12)
      .attr("width", 24)
      .attr("height", 24)
    // .attr("fill", (d: any) => { return color(d.id); })
    _this.nodeEnter.append("text")
      .attr("dx", 12)
      .attr("dy", 0)
      .attr("class", "edge-count")
      .text((d: any) => {return " +" + d.edgeCount;});
    _this.nodeEnter.append("text")
      .attr("dx", 0)
      .attr("dy", 24)
      .attr("text-anchor", "middle")
      .attr("class", "node-label")
      .text((d: any) => { return d.labelData; });

    ticked();

    function ticked() {
      _this.link
        .attr("x1", (d: any) => { return d.source.x; })
        .attr("y1", (d: any) => { return d.source.y; })
        .attr("x2", (d: any) => { return d.target.x; })
        .attr("y2", (d: any) => { return d.target.y; })
        .attr("style", (d: any) => {return d.directed ? "marker-end: url(#end-arrow)" : ""})
        .attr("class", (d: any) => {return (d.filtered ? " filtered" : "")});

      _this.node
        .attr("transform", (d: any) => { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("class", (d: any) => {return "node" + (d.filteredInGraph ? " filtered" : (d.selected ? " selected" : ""))});

      _this.node
        .selectAll(".edge-count")
        .text((d: any) => {return (d.edgeCount > 0) ? (" +" + d.edgeCount) : "";});
    }

    function clicked(d, i, a) {
      _this.clicked.emit({ctrlKey: d3.event.ctrlKey, nodeId: d.id});
      d.selected = !d.selected ;
      d.fixed = !d.fixed;
      // if (!d.fixed) leave(d);
      // else fix(d);
    }

    function dblclicked(d) {
      d.expanded = !d.expanded;
      if (!d.expanded)
        _this.collapseNode.emit(d.id);
      else
        _this.expandNode.emit(d.id);
    }

    function mouseover(d) {
      fix(d);
    }

    function mouseout(d) {
      // if (!d.fixed)
      leave(d);
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      fix(d);
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      // d.fx = null;
      // d.fy = null;
      // d.fixed = true;
      // fix(d);
      leave(d);
    }

    function fix(d) {
      d.fx = d.x;
      d.fy = d.y;
    }

    function leave(d) {
      d.fx = null;
      d.fy = null;
    }
  }
}
