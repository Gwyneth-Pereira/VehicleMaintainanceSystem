import { Component, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Cars, DataSrvService, paired, Users } from '../data-srv.service';
import { IonModal } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild(IonModal) modal: IonModal;
  Devices:paired[];//For Adding Paired Devices
  SupportedOBD;
  BluetoothFlag:boolean;//Bluetooth Flag to Change Buttons
  SupportedFlag:boolean;//Supported Flag to Open up List
  isModalOpen:boolean=false;//Variable to open and close the modal page
  public User: Observable<Users[]>;//Details about the User will be stored in this variable
  slideOpts = { initialSlide: 0, speed: 400};
  public Car: Observable<Cars[]>;


  constructor(private bluetooth:BluetoothSerial, private DataSrv:DataSrvService,public router:Router ,private permission:AndroidPermissions) {
    this.isModalOpen=this.DataSrv.isModalOpen;
    this.SupportedFlag=this.DataSrv.SupportedFlag;
    this.BluetoothFlag=this.DataSrv.BluetoothFlag;
  }

ngOnInit(){
this.User=this.DataSrv.getUsers();
this.Car=this.DataSrv.getCars();//no comment
}

Pair()
{
  //need someway to know which slide the user has selected.
  //get the car "ID" of that car so that later when we are saving the "VIN" we have an index. 
  this.DataSrv.isModalOpen=true;
  this.isModalOpen=this.DataSrv.isModalOpen;
  this.bluetooth.isEnabled().then(
  res=>{
    this.listDevices();
      },
  eror=>{
    this.bluetooth.enable();
    this.listDevices();
        })
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
this.modal.dismiss(null, 'cancel');
this.DataSrv.presentToast("Connected Successfully");
this.DataSrv.BluetoothFlag=false;
this.BluetoothFlag=this.DataSrv.BluetoothFlag;
this.DataSrv.deviceConnected('01'); 
this.BluetoothFlag=this.DataSrv.BluetoothFlag;
this.SupportedFlag=this.DataSrv.SupportedFlag;
this.isModalOpen=this.DataSrv.isModalOpen;
this.router.navigate(['tabs/tab1']);



},error=>{
  this.DataSrv.showError("Connection Timed Out",error);


})

}
}

diconnect()
{
  this.BluetoothFlag=true;
  this.SupportedFlag=false;
  this.isModalOpen=false;
  this.DataSrv.Disconnect();
  
}


OpenList()
{
  this.SupportedOBD=this.DataSrv.SupportedOBD;
  this.SupportedFlag=true;
}





}
