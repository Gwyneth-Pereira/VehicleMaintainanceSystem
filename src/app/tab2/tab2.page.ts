import { Component, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Cars, DataSrvService, paired, Users } from '../data-srv.service';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild(IonModal) modal: IonModal;
  Devices:paired[];//For Adding Paired Devices
  queue=['ATZ\r','ATS0\r','ATL0\r','ATSP0\r','0100\r','0902\r'];//Setting Up OBD-II Commands
  BluetoothFlag=true;//Bluetooth Flag to Change Buttons
  SupportedOBD;//An Array that Contains all the data related to 0100 Response
  SupportedFlag:boolean;//Supported Flag to Open up List
  SupportedPIDS;//Decimal Response Converted from Hex response that came from OBD
  index=0;//Index to guide the obd command array to the next point
  isModalOpen;//Variable to open and close the modal page
  public User: Observable<Users[]>;//Details about the User will be stored in this variable
  slideOpts = { initialSlide: 1, speed: 400};
  public Car: Observable<Cars[]>;


  constructor(private bluetooth:BluetoothSerial, private DataSrv:DataSrvService, private action:ActionSheetController, private permission:AndroidPermissions, private alert: AlertController, private toastctrl:ToastController) {
    this.isModalOpen=false;
    this.SupportedOBD=this.DataSrv.Support;
    this.SupportedFlag=false;
  }

ngOnInit(){
this.User=this.DataSrv.getUsers();
this.Car=this.DataSrv.getCars();//no comment
}

Pair()
{
  //need someway to know which slide the user has selected.
  //get the car "ID" of that car so that later when we are saving the "VIN" we have an index. 
  this.isModalOpen=true;
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
  error => {this.showError("Error",error);}); 

}
 
connect(dvc)
{
if(dvc.address=="")
this.showError("Alert","No Address Found. Please Try Again");
else{
this.bluetooth.connect(dvc.address).subscribe(success=>
{
this.modal.dismiss(null, 'cancel');
this.presentToast("Connected Successfully");
this.BluetoothFlag=false;
this.deviceConnected(); 


},error=>{
  this.showError("Connection Timed Out",error);


})

}
}

deviceConnected()
{
this.bluetooth.subscribe('>').subscribe
(success=>{
this.dataReceived(success);

}, error => {
  this.showError("Error During Receivng Data",error);
  this.diconnect();

});
  this.InitiateOBD(this.queue[this.index++]);

}

diconnect()
{
  this.BluetoothFlag=true;
  this.index=0;
  this.SupportedFlag=false;
  this.isModalOpen=false;
  this.bluetooth.disconnect();
  this.presentToast("Bluetooth Disconnected");
}
dataReceived(data)
{
  var cmd, totalcmds, SingleString;
  cmd=data.toString('utf8');
  totalcmds=cmd.split('>');
  for(let i=0;i<totalcmds.length;i++)
    {
      SingleString=totalcmds[i];
      if(SingleString==='')
        continue;
      var multipleRes=SingleString.split('\r');
      if(multipleRes[0]==='0100')
      {
        this.SupportedPIDS=multipleRes[3].toString();
        this.SupportedPIDS=this.SupportedPIDS.substring(4);
        this.SupportedPIDS= (parseInt(this.SupportedPIDS,16)).toString(2);
        for(let k=0;k<this.SupportedOBD.length;k++)
        {
          if(this.SupportedPIDS.charAt(k)=='1')
            this.SupportedOBD[k].Value="Yes";
          else
          this.SupportedOBD[k].Value="No";
        }
        
      }
      if(multipleRes[0]==='0902')
      {
        if(multipleRes[3]==='NO DATA')//If the Car Desnt Support Mode 9
          this.showError("Alert","This Car Does not Support Mode 09(Vehicle Identification Number). Hence No Data will be Saved to Cloud")
        else if(multipleRes)//if the VIN from the car (that we get from firebase) has a default value.
        {
          //this is the first time pairing with the car
          //Save the VIN into the database
        }
        else//If the VIN from the car (that we get from firebase) does not match the VIN from the OBD Scan
        {
          this.showError("Error", "Please Connect with the correct Car to Save your Data");
          this.diconnect();
          
        }  
      }
      
      
    } 
    if(this.index<this.queue.length)
      this.InitiateOBD(this.queue[this.index++]);
    else
     this.presentToast("OBD-II Setup Completed"); 
     
}

OpenList()
{
  this.SupportedFlag=true;
}
InitiateOBD(cmd)
{
  try{
  this.bluetooth.write(cmd+'\r');
  }catch(error){
  this.presentToast("Error Writing OBD-II Command");
  }
    
  
  
}
async  presentToast(msg) {
let toast = await this.toastctrl.create({
message: msg,
duration: 2000,
position:"top"
})
toast.present();
}

async showError(Header,msg) {
let  alert = await this.alert.create({
message: msg,
subHeader: Header,
buttons: ['OK']
});
await alert.present(); 
}

}
