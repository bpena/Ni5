import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from "@angular/router";
import {SchemaService} from "../../services/connection/schema.service";
import {SearchService} from "../../services/connection/search.service";

@Component({
  selector: 'ni5-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  host: { 'class': 'row-flex' },
  encapsulation: ViewEncapsulation.None
})
export class SearchComponent implements OnInit {
  private criteria: string = "";
  private schema:number;

  constructor(
    private router: Router,
    private schemaService: SchemaService,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.schemaService.getCurrentSchema()
      .subscribe(value => {
        this.schema = value;
      });

    this.searchService.getCriteria()
      .subscribe(value => {
        this.criteria = value;
      })
  }

  private updateSchema(schema: any) {
    this.schema = schema.id;
    this.onSearch();
  }

  private onSearch():void {
    if (this.criteria && this.criteria != '') {
      let link = ['list', this.schema, this.criteria];
      this.schemaService.setCurrentSchema(this.schema);
      this.router.navigate(link)
    }
  }

}
