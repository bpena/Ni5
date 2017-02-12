import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {SearchService} from "../connection/search.service";
import {ActivatedRoute} from "@angular/router";
import {SchemaService} from "../connection/schema.service";
import {Node} from "./node";

@Injectable()
export class NodeService {
  private nodeSelectedList: Node[];
  private nodeEdgesList: any[];
  private nodeUnselectedList: Node[];
  private nodeDataList : any[];
  private nodeSelectedListObservable  : BehaviorSubject<Node[]>;
  private edgeSelectedListObservable  : BehaviorSubject<any[]>;
  private nodeUnselectedListObservable : BehaviorSubject<Node[]>;
  private nodeDataListObservable      : BehaviorSubject<{}>;
  private schemaId : number;

  private metaData: Object;

  private showNodeLabel : boolean;
  private showNodeLabelObservable     : BehaviorSubject<boolean>;

  constructor(
    private searchService : SearchService,
    private route: ActivatedRoute,
    private schemaService : SchemaService
  ) {
    this.nodeSelectedListObservable     = new BehaviorSubject([]);
    this.edgeSelectedListObservable     = new BehaviorSubject([]);
    this.nodeUnselectedListObservable   = new BehaviorSubject([]);
    this.nodeDataListObservable         = new BehaviorSubject({});
    this.metaData                       = null;

    this.nodeUnselectedList = [];

    this.showNodeLabel                  = false;
    this.showNodeLabelObservable        = new BehaviorSubject(this.showNodeLabel);

    this.schemaService.getCurrentSchema().subscribe(data => {
      this.schemaId = data;
    });

    this.schemaService.getMetadata().subscribe(data => {
      this.metaData = data;
    });
  }


  register(): Observable<Node[]> {
    return this.nodeSelectedListObservable;
  }

  registerEdge(): Observable<any[]> {
    return this.edgeSelectedListObservable;
  }

  registerUnselectNode(): BehaviorSubject<Node[]> {
    return this.nodeUnselectedListObservable;
  }

  registerNodeData() : BehaviorSubject<{}> {
    return this.nodeDataListObservable;
  }

  registerShowNodeLabel() : BehaviorSubject<boolean> {
    return this.showNodeLabelObservable;
  }

  addNodes(nodes: Node[]) : void {
    nodes.forEach(node => {
      this.nodeSelectedList.push(node);
    });
    this.nodeSelectedListObservable.next(this.nodeSelectedList);
  }

  unselectNode(nodeList: Node[]): void {
    let selectedNodeIndex;
    nodeList.forEach(node => {
      selectedNodeIndex = -1;
      this.nodeSelectedList.forEach((selectedNode, index) => {
        if (selectedNode.id == node.id)
          selectedNodeIndex = index;
      });

      if(selectedNodeIndex != -1) {
        this.nodeSelectedList.splice(selectedNodeIndex, 1);
      }
    });

    this.nodeSelectedListObservable.next(this.nodeSelectedList);
    // this.nodeToUnselectList = nodeList;
    // this.nodeToUnselecListObservable.next(this.nodeToUnselectList);
  }

  selectNode(nodeIdList : number[]) : void {
    let nodeToSelect;
    let nodeToSelectList : Node[] = [];
    let nodeData;
    let latLon;
    let labelDataList;
    let labelData;
    nodeIdList.forEach(nodeId => {
      labelData = "";
      latLon = this.getLatLonFromMetadata(nodeId);
      nodeToSelect = new Node();
      nodeToSelect.id = nodeId;

      nodeData = Object.keys(this.nodeDataList).filter(nodeId => {return nodeId == nodeToSelect.id});
      nodeData = this.nodeDataList[nodeData];
      labelDataList = this.getDecodedData(nodeToSelect.id, "inLabel", true);
      labelDataList.forEach(label => {
        if(label.value !== undefined && label.value !== null)
          labelData = labelData.concat(label.value + " ");
      });

      nodeToSelect.lon = (nodeData.data[latLon.lon]) ? nodeData.data[latLon.lon] : null;
      nodeToSelect.lat = (nodeData.data[latLon.lat]) ? nodeData.data[latLon.lat] : null;
      nodeToSelect.labelData = labelData;
      nodeToSelect.tooltipData = this.getDecodedData(nodeToSelect.id, "inToolTip", true);
      nodeToSelect.iconName = 'assrts/images/icons/' + nodeData.metaphor.metaphors["Default"].iconName;
      nodeToSelect.iconCode = this.getImage(nodeData.metaphor.metaphors["Default"].iconName);
      nodeToSelectList.push(nodeToSelect);
    });
    this.addNodes(nodeToSelectList);
  }

  updateNodeList(nodeList: Node[]) : void {
    this.nodeSelectedList = nodeList;
    this.nodeSelectedListObservable.next(this.nodeSelectedList);
  }

  cleanNodeList(): void {
    this.nodeSelectedList = [];
    this.nodeSelectedListObservable.next(this.nodeSelectedList);
  }

  addNodeEdge(edge : any) : void {
    this.nodeEdgesList.push(edge);
    this.edgeSelectedListObservable.next(this.nodeEdgesList);
  }

  setNodeData(nodeDataList : any[], nodeEdges : any[]) {
    let dataList = [];
    let nodeData;
    let node : Node;
    let nodeList : Node[];
    let responseValue;

    nodeDataList.forEach(node => {
      nodeData = {
        "id" : node.id,
        "entityId" : node.type
      };
      dataList.push(nodeData);
    });
    //TODO: use actual schema data
    this.searchService.getNodeDataForList(dataList, this.schemaId)
      .subscribe(response => {
        responseValue = response.value;
        // nodeList = [];
        let objectKeys = Object.keys(responseValue);
        for (let i = 0; i <= objectKeys.length - 1; i++) {
          // node = new Node();
          // node.id = responseValue[objectKeys[i]].id;
          // node.lat = responseValue[objectKeys[i]].data[7];
          // node.lon = responseValue[objectKeys[i]].data[6];
          //
          // let edgeTarget = nodeEdges.filter(edge => {return edge.data.target == node.id || edge.data.source == node.id});
          // if(edgeTarget) {
          //     node.edges = edgeTarget;
          // }

          // nodeList.push(node);
          // this.addNode(node);
          this.addNormalizedData(responseValue[objectKeys[i]]);
        }
        this.nodeDataListObservable.next(this.nodeDataList);
      });

    // this.nodeDataList = nodeDataList;
  }

  normalizeData(nodeDataList: any[]): any[] {
    return [];
  }

  setNormalizedData(nodeData : any[]) {
    this.nodeDataList = nodeData;
  }

  private addNormalizedData(nodeData) {
    this.nodeDataList[nodeData.id] = nodeData;
  }

  addNormalizedDataList(nodeDataList : any[]) {
    nodeDataList.forEach(nodeData => {
      this.nodeDataList[nodeData.id] = nodeData;
    });
    this.nodeDataListObservable.next(this.nodeDataList);
  }

  /**
   * just add new nodes
   * @param nodeDataList
   */
  addRawDataList(nodeDataList : any[]) {
    this.nodeDataListObservable.next(nodeDataList);
  }

  getNode(nodeId : number) {
    return this.nodeDataList[nodeId];
  }

  getSelectedNode(nodeId : number) : Node {
    let result : Node;
    let selectedNode = this.nodeSelectedList.filter(node =>{
      return node.id == nodeId;
    });

    if(selectedNode.length > 0) {
      result = selectedNode[0];
    }
    else {
      result = null;
    }
    return result;
  }

  /**
   *
   * @param id
   * @param attribute
   * @param value
   * @returns {null}
   */
  getDecodedData(nodeId: number, attribute: string, value: any): any[] {

    let result = [];
    // let node = this.currentData[id];
    let node = this.getNode(nodeId);
    let definitions: any[] = this.metaData["definitions"];
    let attributes: any[] = null;

    let nodeDef = definitions.filter(def => {
      return def.id == node.entityId;
    });
    if(!nodeDef || nodeDef.length == 0) return null;
    nodeDef = nodeDef[0];
    attributes = nodeDef["attributes"];

    attributes = attributes.filter(atr => {

      return (atr[attribute] == value);

    }).sort((left, right): number => {

      if(left["sort"] < right["sort"]) return -1;
      if(left["sort"] > right["sort"]) return 1;
      return 0;
    });

    attributes.forEach(attr => {
      result.push({
        name: attr.name,
        label: attr.label,
        value: node.data[attr.id]
      });
    });
    return result;
  }

  getLatLonFromMetadata(nodeId : number) : {} {
    let result;
    let finalResult;
    let node = this.getNode(nodeId);
    let definitions : any[] = this.metaData["definitions"];
    let attributes;

    let nodeDef = definitions.filter(def => {
      return def.id == node.entityId;
    });

    if(!nodeDef || nodeDef.length == 0) return null;
    nodeDef = nodeDef[0];
    attributes = nodeDef["attributes"];

    finalResult = {};
    result = attributes.filter(attr => {
      return attr.name == 'lat'
    });
    finalResult['lat'] = result[0].id;

    result = attributes.filter(attr => {
      return attr.name == 'lon';
    });

    finalResult['lon'] = result[0].id;

    return finalResult
  }

  updateShowNodeLabel(showNodeLabel: boolean) {
    //console.log("NodeService.updateShowNodeLabel", showNodeLabel);
    this.showNodeLabelObservable.next(showNodeLabel);
  }

  getImage(value: string): string {
    let result : string;
    let map: any = {
      'government_a.png': '0xe800', /* '' */
      'health_economist.png': '0xe801', /* '' */
      'hospc.png': '0xe802', /* '' */
      'hospd.png': '0xe803', /* '' */
      'hospital.png': '0xe804', /* '' */
      'hospital_a.png': '0xe805', /* '' */
      'hta.png': '0xe806', /* '' */
      'iassociation4.png': '0xe807', /* '' */
      'iboard1.png': '0xe808', /* '' */
      'icarenetwork1.png': '0xe809', /* '' */
      'icon_publikation_2.png': '0xe80a', /* '' */
      'ihcn_a.png': '0xe80b', /* '' */
      'ihn_c.png': '0xe80c', /* '' */
      'ihn_d.png': '0xe80d', /* '' */
      'iinstitution.png': '0xe80e', /* '' */
      'insurance.png': '0xe80f', /* '' */
      'ipharmacy.png': '0xe810', /* '' */
      'ipharmacy4.png': '0xe811', /* '' */
      'journal_2.png': '0xe812', /* '' */
      'journalist.png': '0xe813', /* '' */
      'meeting3.png': '0xe814', /* '' */
      'ngo.png': '0xe815', /* '' */
      'ngo_a.png': '0xe816', /* '' */
      'ngo_c.png': '0xe817', /* '' */
      'ngo_d.png': '0xe818', /* '' */
      'nurse.png': '0xe819', /* '' */
      'other.png': '0xe81a', /* '' */
      'other_healthcare_professional.png': '0xe81b', /* '' */
      'otherc.png': '0xe81c', /* '' */
      'otherd.png': '0xe81d', /* '' */
      'otherorg.png': '0xe81e', /* '' */
      'patient-consumer.png': '0xe81f', /* '' */
      'pfizer_a2.png': '0xe820', /* '' */
      'pfizer_d2.png': '0xe821', /* '' */
      'pfizer_new_logo.png': '0xe822', /* '' */
      'pfizerc2.png': '0xe823', /* '' */
      'pharmacist.png': '0xe824', /* '' */
      'pharmacy.png': '0xe825', /* '' */
      'pharmacy_a.png': '0xe826', /* '' */
      'pharmacyc.png': '0xe827', /* '' */
      'pharmacyd.png': '0xe828', /* '' */
      'phct.png': '0xe829', /* '' */
      'phct_c.png': '0xe82a', /* '' */
      'phct_d.png': '0xe82b', /* '' */
      'pht_a.png': '0xe82c', /* '' */
      'physician.png': '0xe82d', /* '' */
      'policy_analyst.png': '0xe82e', /* '' */
      'politician.png': '0xe82f', /* '' */
      'private_hc_a.png': '0xe830', /* '' */
      'private_payor_a.png': '0xe831', /* '' */
      'private_payord.png': '0xe832', /* '' */
      'privatehc.png': '0xe833', /* '' */
      'privatehc_c.png': '0xe834', /* '' */
      'privatehc_d.png': '0xe835', /* '' */
      'privatepayorc.png': '0xe836', /* '' */
      'public_speaking.png': '0xe837', /* '' */
      'publication.png': '0xe838', /* '' */
      'publication_2.png': '0xe839', /* '' */
      'regulatory_body_a.png': '0xe83a', /* '' */
      'regulatorybody.png': '0xe83b', /* '' */
      'regulatorybodyc.png': '0xe83c', /* '' */
      'regulatorybodyd.png': '0xe83d', /* '' */
      'research.png': '0xe83e', /* '' */
      'research_institute_a.png': '0xe83f', /* '' */
      'research_institutec.png': '0xe840', /* '' */
      'research_instituted.png': '0xe841', /* '' */
      'researcher.png': '0xe842', /* '' */
      'senior_care_a.png': '0xe843', /* '' */
      'seniorcare.png': '0xe844', /* '' */
      'seniorcarec.png': '0xe845', /* '' */
      'seniorcared.png': '0xe846', /* '' */
      'symposium2.png': '0xe847', /* '' */
      'thinktank.png': '0xe848', /* '' */
      'thinktank_a.png': '0xe849', /* '' */
      'thinktankc.png': '0xe84a', /* '' */
      'thinktankd.png': '0xe84b', /* '' */
      'univc.png': '0xe84c', /* '' */
      'univd.png': '0xe84d', /* '' */
      'university_a.png': '0xe84e', /* '' */
      'university_big.png': '0xe84f', /* '' */
      'wholesaler.png': '0xe850', /* '' */
      'wholesaler_a.png': '0xe851', /* '' */
      'wholesalerc.png': '0xe852', /* '' */
      'wholesalerd.png': '0xe853', /* '' */
      'access_body_c.png': '0xe854', /* '' */
      'access_body_d.png': '0xe855', /* '' */
      'access_body2.png': '0xe856', /* '' */
      'access_bodya.png': '0xe857', /* '' */
      'association_a.png': '0xe858', /* '' */
      'associationc.png': '0xe859', /* '' */
      'associationd.png': '0xe85a', /* '' */
      'civil_servant.png': '0xe85b', /* '' */
      'clinic.png': '0xe85c', /* '' */
      'clinic_a.png': '0xe85d', /* '' */
      'clinic_c.png': '0xe85e', /* '' */
      'clinic_d.png': '0xe85f', /* '' */
      'clinical_trial.png': '0xe860', /* '' */
      'cme.png': '0xe861', /* '' */
      'committeeb.png': '0xe862', /* '' */
      'company_a.png': '0xe863', /* '' */
      'companyc.png': '0xe864', /* '' */
      'companyd.png': '0xe865', /* '' */
      'ddassg.png': '0xe866', /* '' */
      'executive.png': '0xe867', /* '' */
      'general.png': '0xe868', /* '' */
      'govc.png': '0xe869', /* '' */
      'govd.png': '0xe86a', /* '' */

      /*BLANK IMAGE*/
      //TODO: Add actual image
      'blank.png': 'BLANK'
    };

    result = map[value.toLowerCase()];

    if(result === undefined || result === null || result.length == 0) {
      result = map['blank.png'];
    }

    return result;
  }
}
