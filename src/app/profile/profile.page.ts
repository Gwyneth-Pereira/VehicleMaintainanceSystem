import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataSrvService, Users } from '../data-srv.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
 public cars : CAR[] =[];
 public person: Observable<Users[]>;
 
  constructor(private DataSrv:DataSrvService,) {


    this.cars=   [{name:"Lexas", modelno: "es350",image: "assets\\images\\car.png", engine :"3.5" }
  ,{name:"Honda", modelno: "civic",image: "assets\\images\\car.png", engine :"2.0" }];
  
  console.log(this.cars);
  
  }

 ngOnInit(){
    this.person=this.DataSrv.getUsers();
     
    console.log(this.person);
    
    
    }
    onSubmit()
    {
      this.DataSrv.logoutUser();
    }



}
  export interface CAR{
  name: string;
  modelno: string;
  image: string;
  engine: string;
  }