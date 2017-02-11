export class Node {
  public id: number;
  public lon: number;
  public lat: number;
  public type: string;
  public edgeCount: number;
  public gridId: string;
  public rowNumber: number;
  public labelData: any;
  public tooltipData: any[];
  public iconName: string;
  public edges : any[];
  public iconCode : string;
  public iconClass: string;
  public isFiltered: boolean;
  public isSelected: boolean;
  public isExpanded: boolean;

  public getLabel(showNodeLabel:boolean, showEdgeCount:boolean): string {

    let label = [];
    if(showNodeLabel) {
      this.labelData.forEach(item => {
        label.push(item.value);
      });
    }
    if(showEdgeCount && this.edgeCount > 0) {
      label.push("(" + this.edgeCount + ")");
    }
    if(label.length == 0) return "";
    return label.join(". ");
  };

  public getTooltipHTML() : string {
    let tooltip = [];

    this.tooltipData.forEach(item => {
      tooltip.push("<b>" + item.label + ":</b> " + item.value);
    });

    return tooltip.join("<br>");
  };
}
