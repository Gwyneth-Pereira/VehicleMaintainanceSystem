import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Observable, Subscription } from 'rxjs';
import {DataSrvService, paired } from '../data-srv.service';
import { IonModal, IonSlide, LoadingController, Platform } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Car, FirebaseService, Users } from '../firebase.service';
import { IonSlides } from '@ionic/angular';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page  implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  @ViewChild(IonSlides) slides: IonSlides;
  Devices:paired[];//For Adding Paired Devices
  subscription:Subscription;
  UserID=null; 
  SlideIndex=0;
  intervalID;
 // SupportedOBD;
  BluetoothFlag:boolean;//Bluetooth Flag to Change Buttons
  SupportedFlag:Observable<boolean>;//Supported Flag to Open up Live Data
  //isModalOpen:boolean=false;//Variable to open and close the modal page
  public User: Observable<Users[]>;//Details about the User will be stored in this variable
  slideOpts = { initialSlide: 0, speed: 400, onlyExternal: false}; // the slide on the homepage
  private Cars: Observable<Car[]>;
  private UpCars: Observable<Car[]>;
  private UpdatedCar:Car={}as Car;
  public cars:Car[];
  private C: Observable<Car[]>;
  private VIDError={ID:'',Msg:''};
  constructor(
    private bluetooth:BluetoothSerial,
    private route: ActivatedRoute, 
    private DataSrv:DataSrvService,
    public router:Router ,
    public platform:Platform,
    private permission:AndroidPermissions,
    private loading:LoadingController,
    private Firebase: FirebaseService) 
    {
    
    this.User=this.Firebase.getUsers();
    this.platform.backButton.subscribeWithPriority(-1,()=>{
      
      this.Closing()
    
  })
    
  }
 
  async ngOnInit() {
    
 
    this.BluetoothFlag=this.DataSrv.BluetoothFlag;
    this.UserID= await this.DataSrv.GetVariable('userID');
    this.Cars=this.Firebase.getCar(this.UserID)
    
    this.Cars.pipe(take(1)).subscribe(async res=>{
      if(res[this.SlideIndex]!=null ||res[this.SlideIndex]!=undefined)
      {
        this.UpdatedCar= res[this.SlideIndex];
           
      }
      },error=>{  console.log("Error Subscribing to Car Observable during slidechange ");  this.DataSrv.showError('Error',error)});
     }
     
  OpenCarInfo(value)
  {
    console.log("num plate: "+value);
    let GoToCarInfo: NavigationExtras = { state: {CarID: value }   };
    this.router.navigate(['carinfo'],GoToCarInfo);

  }


Pair()
{
  this.permission.checkPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT).then(async result => {
    console.log('Has permission?',result.hasPermission);
    if(!result.hasPermission)
    {
      await this.permission.requestPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT
        ).then(r=>{
          
        console.log("requested permission: "+r)
      });
    }
    console.log("Pair Button Clicked");
  this.modal.present();
  this.bluetooth.isEnabled().then(
  res=>{
    this.listDevices();
      },
  eror=>{
    this.bluetooth.showBluetoothSettings().then(k=>console.log("Please Pair with OBD-2 "+k))
    this.listDevices();
        })
    
  },
    err => this.permission.requestPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT)
  );
  
}


gonewCarInfo()
{
  
  this.router.navigate(['addnewcar']);
}

 listDevices() 
{ 
  this.slideChange();
  console.log(this.UpdatedCar);
  if(this.UpdatedCar.make==null)
  {
    this.DataSrv.showError("Warning", "Please Select a Car");
    return;
  }
  this.bluetooth.list().then(
  success => {this.Devices = success;}, 
  error => {this.DataSrv.showError("Error",error);}); 

}
slideChange()
{
  this.slides.getActiveIndex().then(index=>{  this.SlideIndex=index; });
  if(this.SlideIndex==undefined)
    this.SlideIndex=0;
 this.Cars.pipe(take(1)).subscribe(async res=>{
  if(res[this.SlideIndex]!=undefined||res[this.SlideIndex]!=null)
  {
    this.UpdatedCar= res[this.SlideIndex];
    
  }
  },error=>{  console.log("Error Subscribing to Car Observable during slidechange ");  this.DataSrv.showError('Error',error)});

}

async connect(dvc)
{
if(dvc.address=="")
this.DataSrv.showError("Alert","No Address Found. Please Try Again");
else{

  const load3=await this.loading.create();
  await load3.present();
 
  this.DataSrv.CarName=this.UpdatedCar.make + "  "+this.UpdatedCar.model;
  this.DataSrv.ChangeSlideStatus(this.slides,true);
  console.log("Called Connect Addr"+dvc.address);
  
  this.permission.checkPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT).then(result => {
    console.log('Has permission?',result.hasPermission);
    if(!result.hasPermission)
    {
      this.permission.requestPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT).then(r=>{console.log("requested permission: "+r.hasPermission)});
    }
      
    this.bluetooth.connectInsecure(dvc.address).subscribe(async success=>
      {
       
      this.DataSrv.deviceConnected('00',this.UpdatedCar.VIN); 
      this.cancel();
      let hideFooterTimeout = setTimeout( async () => {
        let obj1 = await this.DataSrv.GetVariable('PairIssue');
        let obj =  await this.DataSrv.GetVariable('VID');
        
        load3.dismiss();
        console.log("Obj1: "+obj1);
        console.log("Obj: "+obj);
        if(obj1==="This Car doesnt Support OBD-II")
        {
          this.diconnect();
          this.DataSrv.showError("Error","This Car doesnt Support OBD-II");
        }else if(obj=='Please Connect with the correct Car to Save your Data')
        {
          this.diconnect();
          this.DataSrv.showError("Alert","Please Connect with the correct Car to Save your Data");
        }else if(obj=='First Time Pairing. Linking VID with Car')
        {
          this.UpdatedCar.VIN=await this.DataSrv.GetVariable('VIN');
          this.DataSrv.showError("Alert","First Time Pairing. Linking VID with Car");
          this.DataSrv.UpdateCar(this.UpdatedCar,'success');
          this.BluetoothFlag=this.DataSrv.BluetoothFlag;
          this.DataSrv.presentToast("Connected Successfully");
          
        }else{
          
          this.DataSrv.showError("Alert",obj);
          this.DataSrv.UpdateCar(this.UpdatedCar,'success');
          this.BluetoothFlag=this.DataSrv.BluetoothFlag;
          this.DataSrv.presentToast("Connected Successfully");
    
        } 
        this.DataSrv.RemoveVariable('PairIssue');
        this.DataSrv.RemoveVariable('VIN');
        this.DataSrv.RemoveVariable('VID');
        
      }, 5000);
     
    
    },error=>{
        load3.dismiss();
        this.diconnect();
        
        this.router.navigate(['tabs/tabs/tab2']);
        this.DataSrv.showError("Connection Timed Out",error);
        
        });
  },
    err => this.permission.requestPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT)
  );
  
  
 
    
}

}



OpenProfle(uid)
{
  if(!this.BluetoothFlag)
  {
    this.DataSrv.showError("Alert","Please Unpair your Car before viewing profile");

  }else{
    let GoToProfile: NavigationExtras = { state: {UserID: uid }   };
    this.router.navigate(['profile'],GoToProfile);
  }
  
 
}
cancel()
{
  this.modal.dismiss(null, 'cancel');
}
async diconnect()
{ const load4=await this.loading.create();
  await load4.present();
  this.DataSrv.Disconnect(this.slides,this.UpdatedCar);
  this.BluetoothFlag=this.DataSrv.BluetoothFlag;
  this.DataSrv.presentToast("Bluetooth Disconnected");
  await load4.dismiss();
}

Closing()
{
 
}





}
