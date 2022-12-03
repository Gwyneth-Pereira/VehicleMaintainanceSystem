import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Car, CurrentUser, DataSrvService, paired, Users } from '../data-srv.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
 public cars : CAR[] =[];
 public person: Observable<Users[]>;
 public uid :string;
public s: boolean; //to show password
 public User: Observable<Users[]>;//Details about the User will be stored in this variable
  private CAR: Observable<Car[]>;
  public currentUser:Observable<CurrentUser[]>;


  constructor(private DataSrv:DataSrvService,private router: Router,private route: ActivatedRoute) {
  this.s=true;
  
  }

 ngOnInit(){
  this.person=this.DataSrv.getUsers();
      
  this.currentUser=this.DataSrv.getCurrentUser();
  this.User=this.DataSrv.getUsers();
   this.CAR=this.DataSrv.getCars();//no comment
   this.route.queryParams
  .subscribe(params => {
    console.log(params); // { brand: "bmw" }
    
    this.uid=params.uid;
    console.log(this.uid); // bmw
  }
);
   
   this.route.params.subscribe(params => {
        console.log(params['uid']);
        this.uid=params['uid'];
   })  
    

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
    

    
    showpassword() {
      if( this.s)
      this.s=false;
      else
      this.s=true;
    }

    


}
  export interface CAR{
  name: string;
  modelno: string;
  image: string;
  engine: string;
  }