import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import {DataSrvService} from '../data-srv.service';
import { Car, FirebaseService, Users } from '../firebase.service';

@Component({
  selector: 'app-carinfo',
  templateUrl: './carinfo.page.html',
  styleUrls: ['./carinfo.page.scss'],
})
export class CarinfoPage implements OnInit {
 public uid:string;
 public title:string;
 public User: Observable<Users[]>;//Details about the User will be stored in this variable
 public CAR: Observable<Car[]>;
 InsDte;
 private minDate= new Date().toISOString();


  constructor(
    private route: ActivatedRoute,
    private DataSrv:DataSrvService,
    private navCtrl:NavController,
    private Firebase:FirebaseService,
    private loading:LoadingController,
    private localNotify:LocalNotifications,
    private androidPermissions:AndroidPermissions,
    ) { }

  goback()
  {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.User=this.Firebase.getUsers();
    this.CAR=this.Firebase.getCars();
    this.route.params.subscribe(params => {
      console.log(params['uid'] );
      this.uid=params['uid'];
    });
  
  }
  async uploadpic()
  {
    const image =await Camera.getPhoto({
      allowEditing: false,
      resultType:CameraResultType.Base64,
      source:CameraSource.Photos,
    });
    if(image)
    {
      const load=await this.loading.create();
      await load.present();
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => 
        {const res=this.Firebase.uploadImage(this.uid,image,this.title);
      this.localNotify.schedule({
        id:parseInt(this.uid),
        title:this.title,
        text:'Please Change '+this.title,
        trigger:{at:this.InsDte},
        foreground:true
      });
      if(!res)
      {
        this.DataSrv.showError("Error","Upload Failed");
      }
    },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );
      
      load.dismiss();
      
    }
  }
 
}
