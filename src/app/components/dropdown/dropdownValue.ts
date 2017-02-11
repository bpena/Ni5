export class DropdownValue {
  value:any;
  label:string;
  method:any;
  param:any;
  type:string; // item, separator
  toggle:boolean = false;
  toggleValue:boolean = false;

  constructor(value:any, label:string, method:any, type:string, toggle?:boolean, toggleValue?:boolean) {
    this.value = value;
    this.label = label;
    this.method = method;
    this.type = type;
    this.toggle = toggle;
    this.toggleValue = toggleValue;
  }
}
