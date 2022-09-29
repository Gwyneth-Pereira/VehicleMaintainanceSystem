import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  private selectedSegment: string ='Sensor';
  constructor() {}

  segmentChanged(event : any){
  console.log(event.target.value);
  this.selectedSegment=event.target.value;
  }
}
