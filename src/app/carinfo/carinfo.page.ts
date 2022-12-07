import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
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
 private updatedCar:Car={}as Car;
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
    private storage:AngularFireStorage
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
      
    }}

    async changeImage(num)
    {
      console.log("numplate: "+num);
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
          const path ='Documents/'+this.uid+'/Cars/'+num+'.'+image.format;
          const storageRef=this.storage.ref(path);
          try{
          await this.storage.upload(path,blob);
          const imageURL=await storageRef.getDownloadURL();
          this.CAR.subscribe((result)=>
          {
            
            for(let i =0;i<result.length;i++)
            {
              if(result[i].numPlate==num)
              {
                console.log("found car: "+result[i]);
                this.updatedCar=result[i];
                                
              }
            }
          })
          imageURL.subscribe(re=>{
            
            this.updatedCar.carimg=re;
            console.log("CAR URL: "+this.updatedCar.carimg);
            console.log(this.updatedCar);
            
            this.Firebase.updateCar(this.updatedCar).then(succ=>{
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
 

