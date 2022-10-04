import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
 public cars : CAR[] =[];
  
  constructor() {
    this.cars=   [{name:"lexas", modelno: "es350",image: "assets\images\car.png", engine :"3.5" }
  ]
  console.log(this.cars)
  
  }

  ngOnInit() {
  }


}
  export interface CAR{
  name: string;
  modelno: string;
  image: string;
  engine: string;
  }