import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Observable } from 'rxjs';
import {DataSrvService, paired } from '../data-srv.service';
import { IonModal } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Car, FirebaseService, Users } from '../firebase.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page  implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  Devices:paired[];//For Adding Paired Devices
  UserID=null; 
  intervalID;
 // SupportedOBD;
  BluetoothFlag:boolean;//Bluetooth Flag to Change Buttons
  SupportedFlag:Observable<boolean>;//Supported Flag to Open up Live Data
  //isModalOpen:boolean=false;//Variable to open and close the modal page
  public User: Observable<Users[]>;//Details about the User will be stored in this variable
  slideOpts = { initialSlide: 0, speed: 400}; // the slide on the homepage
  private Cars: Observable<Car[]>;
  private nCAR: Observable<Car[]>;
  public cars:Car[];
  constructor(
    private bluetooth:BluetoothSerial,
    private route: ActivatedRoute, 
    private DataSrv:DataSrvService,
    public router:Router ,
    private permission:AndroidPermissions,
    private Firebase: FirebaseService) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.UserID = this.router.getCurrentNavigation().extras.state.userID;
        console.log("ID: "+this.UserID);
      }
    });
   
    this.User=this.Firebase.getUsers();
    this.BluetoothFlag=this.DataSrv.BluetoothFlag;
  }
  ngOnInit() {
    this.Cars=this.Firebase.getCars();
    if(this.UserID==null)
    {
      this.router.navigate(['login']);
    }
   
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
  //need someway to know which slide the user has selected.
  //get the car "ID" of that car so that later when we are saving the "VIN" we have an index. 
  this.DataSrv.isModalOpen=true;
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

editCarDetails(Y)
{
  this.DataSrv.CurrentUser=Y;
  this.router.navigate(['carinfo']);
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
 
connect(dvc)
{
if(dvc.address=="")
this.DataSrv.showError("Alert","No Address Found. Please Try Again");
else{
this.bluetooth.connect(dvc.address).subscribe(success=>
{
this.DataSrv.presentToast("Connected Successfully");
this.DataSrv.BluetoothFlag=false;
this.BluetoothFlag=this.DataSrv.BluetoothFlag;
this.DataSrv.deviceConnected('00'); 
this.modal.dismiss();
this.BluetoothFlag=this.DataSrv.BluetoothFlag;
//this.SupportedFlag=this.DataSrv.SupportedFlag;
//this.isModalOpen=this.DataSrv.isModalOpen;
//this.router.navigate(['tabs/tab1']);



},error=>{
  this.DataSrv.showError("Connection Timed Out",error);


})

}
}

diconnect()
{
  this.BluetoothFlag=true;
  //this.SupportedFlag=false;
  //this.isModalOpen=false;
  this.DataSrv.Disconnect();
  
}







}
