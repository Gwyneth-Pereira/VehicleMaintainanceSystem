import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
 
  constructor(private DataSrv:DataSrvService,private router: Router) {


    this.cars=   [{name:"Lexas", modelno: "es350",image: "assets\\images\\car.png", engine :"3.5" }
  ,{name:"Honda", modelno: "civic",image: "assets\\images\\car.png", engine :"2.0" }];
  
  console.log(this.cars);
  
  }

 ngOnInit(){
    this.person=this.DataSrv.getUsers();
     
    console.log(this.person);
    
    
    }
    onLogOut()
    {

      this.DataSrv.logoutUser().then( sucess=> {this.DataSrv.presentToast("Logged out Sucessfully").then(sucess=> { this.router.navigate(['/login']);});});
      
        
    }
    onDelete()
    {

      this.DataSrv.showChoice("Alert","Sure you want to delete your account??").then( sucess=>
      { 
      if (this.DataSrv.handlerMessage=="confirmed")
      {
        console.log(this.DataSrv.handlerMessage);
        console.log(this.DataSrv.roleMessage);
        // add the code to delete record from firebase and auth . 



      }
      else{
        this.DataSrv.presentToast("Account is not deleted.")

        console.log(this.DataSrv.handlerMessage);
        console.log(this.DataSrv.roleMessage);
      }
    });
    }



}
  export interface CAR{
  name: string;
  modelno: string;
  image: string;
  engine: string;
  }