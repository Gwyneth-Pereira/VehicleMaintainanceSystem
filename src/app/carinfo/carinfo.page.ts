import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonModal, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import {DataSrvService} from '../data-srv.service';
import { Car, FirebaseService, Users } from '../firebase.service';

@Component({
  selector: 'app-carinfo',
  templateUrl: './carinfo.page.html',
  styleUrls: ['./carinfo.page.scss'],
})
export class CarinfoPage implements OnInit {
@ViewChild(IonModal) modal: IonModal;
 public uid:string=null;
 public title:string;
 public User: Observable<Users[]>;//Details about the User will be stored in this variable
 public CAR: Observable<Car[]>;
 private updatedCar:Car={}as Car;
 InsDte;
 private Document={Title:'',Img:''}
 private minDate= new Date().toISOString();


  constructor(
    private route: ActivatedRoute,
    public router:Router,
    private DataSrv:DataSrvService,
    private navCtrl:NavController,
    private Firebase:FirebaseService,
    private loading:LoadingController,
    private localNotify:LocalNotifications,
    private androidPermissions:AndroidPermissions,
    private storage:AngularFireStorage,
    private modalCtrl: ModalController
    ) { 
       this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.uid = this.router.getCurrentNavigation().extras.state.CarID;
        console.log("ID: "+this.uid);
      }
    }); }

  goback()
  {
    this.navCtrl.back();
  }
  async ngOnInit() {
   this.User=this.Firebase.getUsers();
    this.CAR=this.Firebase.getCars();
  
  }
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
  async AddImage()
  {
    const image =await Camera.getPhoto({quality:90, allowEditing: false,resultType:CameraResultType.Uri,source:CameraSource.Photos,});
    if(image)
    {
      const response=await fetch(image.webPath);
      const blob=await response.blob();

      const load3=await this.loading.create();
      await load3.present();
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(async result =>{ 
        const path ='Documents/Cars/'+this.uid+'/'+this.Document.Title+'.'+image.format;
        const storageRef=this.storage.ref(path);
        try{
        await this.storage.upload(path,blob);
        const imageURL=await storageRef.getDownloadURL();
        this.CAR.subscribe((result)=>  {
        for(let i=0;i<result.length;i++) 
            if(result[i].numPlate==this.uid) 
              this.updatedCar=result[i];});
        imageURL.subscribe(re=>{this.Document.Img=re; })
          
        
       
  

  }catch(e){
    console.log(e)
    this.DataSrv.showError("Error",e);
    return null
  }
            },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );
      
      load3.dismiss();
      
    }

  }
  openModal()
  {

    console.log("Clicke open modal");
    this.modal.present();
  }
  Submit()
  {
    this.updatedCar.document.push(this.Document);
    this.Firebase.updateCar(this.updatedCar).then(succ=>{
      this.DataSrv.presentToast('File Uploaded Successfully');
      this.cancel();
      
    },errir=>{
      this.DataSrv.showError("Error",errir);
    });
    this.cancel();
  }
  DelCar(ca)
  {
    this.CAR.subscribe((result)=>
    {
      
      for(let i =0;i<result.length;i++)
      {
        if(result[i].numPlate==ca)
        {
          console.log("found car: "+result[i]);
          this.updatedCar=result[i];
          this.Firebase.deleteCar(this.updatedCar.ID).then(re=>{
            this.DataSrv.presentToast("Car Deleted Successfully");
            this.goback();
          })
                          
        }
      }
    });

  }
 
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
 

