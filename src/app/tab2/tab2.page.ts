import { Component, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DataSrvService, Users } from '../data-srv.service';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild(IonModal) modal: IonModal;
  Devices:paired[];
  queue=['ATZ\r','ATSP0\r','0100\r'];
  receivedData:string ='';
  writeDelay: number=50;
  blue=true;
  index=0;
  btConnected=false;
  btIntervalWriter: any;
  pollerInterval;
  obdcommands=[];
  CarInfo=['03'];
  SavedCarCommand=[];
  RepeatTimer=0;
  isModalOpen;
  sent=false;
  public person: Observable<Users[]>;
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  constructor(private bluetooth:BluetoothSerial, private DataSrv:DataSrvService, private action:ActionSheetController, private permission:AndroidPermissions, private alert: AlertController, private toastctrl:ToastController) {
    this.isModalOpen=false;
  }

ngOnInit(){
this.person=this.DataSrv.getUsers();
}

Pair()
{
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
  error => {this.showError(error);}); 

}
 
connect(dvc)
{
if(dvc.address=="")
this.showError("No Address");
else{
this.bluetooth.connect(dvc.address).subscribe(success=>
{
this.modal.dismiss(null, 'cancel');
this.presentToast("Connected Successfully");
this.blue=false;
this.btConnected = true;
this.deviceConnected(); 


},error=>{
alert("Connect Error: "+error);
this.btConnected = false;
})

}
}

deviceConnected()
{
this.bluetooth.subscribe('>').subscribe
(success=>{
this.dataReceived(success)


}, error => {
alert('Device Connected, Subscribe error: ' + error);
});
  this.InitiateOBD(this.queue[this.index++]);

//this.RequstData();

}
RequstData()
{
   var self=this;
      for (let i = 0; i < self.CarInfo.length; i++) 
    {
      if(self.queue.length < 256)
        self.queue.push(self.CarInfo[i]+1+'\r');
      else
        self.presentToast("Queue Overflow");
    }
  
  this.btIntervalWriter=setInterval(function(){
    if(self.queue.length>0 &&self.btConnected)
    {
      try{
        var cmd=self.queue.shift();
        self.bluetooth.write(cmd+'\r').then(sk=>{
          self.presentToast("Wrote Command");
        },er=>{
          self.presentToast("Error Writing Command");
        })

      }catch(error){
        self.presentToast("Error Writing Command catch Block");
        clearInterval(self.btIntervalWriter);
        this.SavedCarCommand.length=0;
      }
    }
  },this.writeDelay);

}
diconnect()
{
  this.blue=true;
  this.btConnected=false;
  this.queue=['ATZ','ATSP0\r','0100\r'];
  this.SavedCarCommand=[];
  this.index=0;
  clearInterval(this.pollerInterval);
  clearInterval(this.btIntervalWriter)
  this.isModalOpen=false;
  this.bluetooth.disconnect();
  this.presentToast("Bluetooth Disconnected");
}
dataReceived(data)
{
  var cmd, totalcmds, SingleString;
  cmd=this.receivedData+data.toString('utf8');
  totalcmds=cmd.split('>');
  if(totalcmds.length<2)
    this.receivedData=totalcmds[0];
  else{
    for(let i=0;i<totalcmds.length;i++)
    {
      SingleString=totalcmds[i];
      if(SingleString==='')
        continue;
      var multipleRes=SingleString.split('\r');
      console.log("Command: "+multipleRes[0]+", Value:  "+multipleRes[3]);
    } 
    if(this.index<this.queue.length)
    this.InitiateOBD(this.queue[this.index++]);

  }
  
  this.presentToast("OBD-II Setup Completed"); 
}

InitiateOBD(cmd)
{
  var self=this;
   
      try{
    
        self.bluetooth.write(cmd+'\r').then(sk=>{
          
        },er=>{
          self.presentToast("Error Writing Command");
        })

      }catch(error){
        self.presentToast("Error Writing Command catch Block");
        
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

async showError(error) {
let  alert = await this.alert.create({
message: error ,
subHeader: 'Error',
buttons: ['OK']
});
await alert.present(); 
}

}
interface paired {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  
}
interface obdmetric {
  "metricSelectedToPoll":boolean,
  "name":string,
  "description":string,
  "value":string,
  "unit": string
}