import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataSrvService} from '../data-srv.service';
import { LoadingController, NavController } from '@ionic/angular';
import { Car, FirebaseService, Users } from '../firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AngularFireStorage } from '@angular/fire/compat/storage';
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
private updatedUser:Users={}as Users;

  constructor(
    private DataSrv:DataSrvService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private Firebase: FirebaseService,
    private loading:LoadingController,
    private androidPermissions:AndroidPermissions,
    private storage:AngularFireStorage) {
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
  OpenCarInfo(value)
  {
    console.log("num plate: "+value);
    let GoToCarInfo: NavigationExtras = { state: {CarID: value }   };
    this.router.navigate(['carinfo'],GoToCarInfo);

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
    async changeImage()
    {
      const image =await Camera.getPhoto({
        quality:90,
        allowEditing: false,
        resultType:CameraResultType.Uri,
        source:CameraSource.Photos,
      });
      
      if(image)
      {
        const response=await fetch(image.webPath);
        const blob=await response.blob();

        const load=await this.loading.create();
        await load.present();
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
          async result => 
          { 
          const path ='Documents/'+this.uid+'/Profile.'+image.format;
          const storageRef=this.storage.ref(path);
          try{
          await this.storage.upload(path,blob);
          const imageURL=await storageRef.getDownloadURL();
          this.User.subscribe((result)=>
          {
            console.log("in sub: "+result);
            for(let i =0;i<result.length;i++)
            {
              if(result[i].userID==this.uid)
              {
                
                this.updatedUser=result[i];
                                
              }
            }
          })
          imageURL.subscribe(re=>{
            
            this.updatedUser.img=re;
            console.log("Af: "+this.updatedUser.img);
            this.Firebase.updateUser(this.updatedUser).then(succ=>{
              this.DataSrv.presentToast('File Uploaded Successfully');
              
            },errir=>{
              this.DataSrv.showError("Error",errir);
            });



            })
            
          
         
    

    }catch(e){
      console.log(e)
      this.DataSrv.showError("Error",e);
      return null
    }
              },
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
        );
        
        load.dismiss();
        
      }

    }
}
 