import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataSrvService} from '../data-srv.service';
import { NavController } from '@ionic/angular';
import { Car, FirebaseService, Users } from '../firebase.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

public uid :string;
public s: boolean; //to show password
public User: Observable<Users[]>;//Details about the User will be stored in this variable
public CAR: Observable<Car[]>;

  constructor(
    private DataSrv:DataSrvService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private Firebase: FirebaseService) {
  this.s=true; 
  }

  goback()
  {
    this.navCtrl.back();
  }
  goNewCar()
  {
    let navigationExtras: NavigationExtras = { state: {userID: this.uid }   };
    this.router.navigate(['addnewcar'],navigationExtras);
  }
 ngOnInit(){
   this.User=this.Firebase.getUsers();
   this.CAR=this.Firebase.getCars();
   this.route.params.subscribe(params => {  this.uid=params['uid'];  });
  }
    
 onLogOut()
    {
     this.Firebase.logoutUser().then( sucess=> 
      {this.DataSrv.presentToast("Logged out Sucessfully");
      this.router.navigate(['login']);
    }).catch(error=>alert(error));      
    }
    
 
    
  showpassword() 
  {
      if( this.s)
      this.s=false;
      else
      this.s=true;
    }
}
 