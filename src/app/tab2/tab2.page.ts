import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Observable } from 'rxjs';
import {DataSrvService, paired } from '../data-srv.service';
import { IonModal, IonSlide, LoadingController } from '@ionic/angular';
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
  UserID=null; 
  SlideIndex=0;
  intervalID;
 // SupportedOBD;
  BluetoothFlag:boolean=true;//Bluetooth Flag to Change Buttons
  SupportedFlag:Observable<boolean>;//Supported Flag to Open up Live Data
  //isModalOpen:boolean=false;//Variable to open and close the modal page
  public User: Observable<Users[]>;//Details about the User will be stored in this variable
  slideOpts = { initialSlide: 0, speed: 400, onlyExternal: false}; // the slide on the homepage
  private Cars: Observable<Car[]>;
  private UpdatedCar:Car={}as Car;
  public cars:Car[];
  private C: Observable<Car[]>;
  private VIDError={ID:'',Msg:''};
  constructor(
    private bluetooth:BluetoothSerial,
    private route: ActivatedRoute, 
    private DataSrv:DataSrvService,
    public router:Router ,
    
    private permission:AndroidPermissions,
    private loading:LoadingController,
    private Firebase: FirebaseService) {
    
    this.User=this.Firebase.getUsers();
    
  }
  async ngOnInit() {
    this.Cars=this.Firebase.getCars();
    
    this.Cars.pipe(take(1)).subscribe(async res=>{
      console.log('Slide Index: '+this.SlideIndex);
      this.UpdatedCar= res[this.SlideIndex];
     
        },error=>{  console.log("Error Subscribing to Car Observable during slidechange ");  this.DataSrv.showError('Error',error)});
    this.UserID= await this.DataSrv.GetVariable('userID');
    //this.C=this.Firebase.get_specific_user_cars(this.UserID);
  
   /*
    if(this.UserID==null)
    {
      this.router.navigate(['login']);
    }else
    {
      
    }
    
    this.nCAR=this.Firebase.getCars();
    this.nCAR.subscribe(res=>
      {
        for(let i=0;i<res.length;i++)
        {
          if(this.UserID==res[i].userId)
          {
            this.cars.push(res[i]);
            console.log("in res:"+res[i]);
            
          }
          
        }
        
      });
      console.log("data:"+this.cars); */

  //  //cut down the array of cars 
  //  for(let x of this.CAR )
  //  if (this.UserID==x.userId)
  //  this.cars=x;
  }
  OpenCarInfo(value)
  {
    console.log("num plate: "+value);
    let GoToCarInfo: NavigationExtras = { state: {CarID: value }   };
    this.router.navigate(['carinfo'],GoToCarInfo);

  }


Pair()
{
  console.log("Pair Button Clicked");
  this.modal.present();
  //need someway to know which slide the user has selected.
  //get the car "ID" of that car so that later when we are saving the "VIN" we have an index. 
 
  //this.isModalOpen=this.DataSrv.isModalOpen;
  this.bluetooth.isEnabled().then(
  res=>{
    this.listDevices();
      },
  eror=>{
    this.bluetooth.enable();
    this.listDevices();
        })
}


gonewCarInfo()
{
  let navigationExtras: NavigationExtras = {
    state: {userID: this.UserID }   };
  this.router.navigate(['addnewcar'],navigationExtras);
}

 listDevices() 
{ 
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
  console.log('Slide Index: '+this.SlideIndex);
  this.UpdatedCar= res[this.SlideIndex];
 
    },error=>{  console.log("Error Subscribing to Car Observable during slidechange ");  this.DataSrv.showError('Error',error)});

}
ChangeSlideStatus(lock:boolean)
{
  this.slides.lockSwipes(lock);

}
async connect(dvc)
{
if(dvc.address=="")
this.DataSrv.showError("Alert","No Address Found. Please Try Again");
else{
  
  const load3=await this.loading.create();
  await load3.present();
  this.slideChange();
  this.ChangeSlideStatus(true);
  this.bluetooth.connect(dvc.address).subscribe(async success=>
    {
   
    this.BluetoothFlag=false;
    console.log("VIN "+this.UpdatedCar.VIN);
    this.DataSrv.deviceConnected('00',this.UpdatedCar.VIN); 
    this.UpdateCar('success');
    this.cancel();
    this.DataSrv.presentToast("Connected Successfully");
    const obj = await this.DataSrv.GetVariable('VID');
    this.DataSrv.showError("Alert", obj);
    
  
    
    },error=>{
     
      this.DataSrv.showError("Connection Timed Out",error);});
  load3.dismiss();   
}
//this.DataSrv.showError("Alert",");
}
UpdateCar(color:string)
{
  console.log(this.UpdatedCar);
  this.UpdatedCar.blue=color;
  this.Firebase.updateCar(this.UpdatedCar).then(r=>
     {console.log("Updated Car Color to "+color);},
  e=>{ console.log("Error Updating Car Color to "+color); this.DataSrv.showError('Error',e)})
  

}
cancel()
{
  this.modal.dismiss(null, 'cancel');
}
async diconnect()
{ const load4=await this.loading.create();
  await load4.present();
  
  this.ChangeSlideStatus(false);
  this.BluetoothFlag=true;
  this.DataSrv.Disconnect();
  this.UpdateCar('Dark');
  
  this.DataSrv.presentToast("Bluetooth Disconnected");

  await load4.dismiss();
}







}
