import {Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'ni5-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  host: { 'class': 'row-flex' },
  encapsulation: ViewEncapsulation.None
})
export class SearchComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
