import { Component, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DataSrvService } from '../data-srv.service';
import { IonModal } from '@ionic/angular';
import { obdinfo } from '../obdinfo';
import * as moment from 'moment';
import * as _ from 'underscore';

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
  i=0;
  btConnected=false;
  btIntervalWriter: any;
  pollerInterval;
  obdcommands=[];
  CarInfo=['03'];
  SavedCarCommand=[];
  RepeatTimer=0;
  isModalOpen=false;
  constructor(private bluetooth:BluetoothSerial,
              private DataSrv:DataSrvService,
              private action:ActionSheetController,
              private permission:AndroidPermissions, 
              private alert: AlertController,
              private toastctrl:ToastController) {
  }
 
Pair()
{
  this.isModalOpen=true;
  this.bluetooth.isEnabled().then(

    res=>{this.listDevices();},
    eror=>{this.bluetooth.enable();
            this.listDevices();})
}
    /*
    this.checking=true;
   this.permission.checkPermission(this.permission.PERMISSION.BLUETOOTH_SCAN).then(
      result => {this.permission.requestPermissions([this.permission.PERMISSION.BLUETOOTH_SCAN,this.permission.PERMISSION.BLUETOOTH_CONNECT]);
                this.bluetooth.isEnabled().then(res=>
                  {      this.listunPairedDevices();
                  },
                  eror=>{this.bluetooth.enable();
                    this.listunPairedDevices();})},
      err => {this.permission.requestPermissions([this.permission.PERMISSION.BLUETOOTH_SCAN,this.permission.PERMISSION.BLUETOOTH_CONNECT]);
              console.log('requestPermsson Scan :',err.hasPermission)});

   
    
    */
   
listDevices() 
{ 
  this.bluetooth.list().then(
  success => {this.Devices = success;}, 
  error => {this.showError(error);}); 

}
  async showError(error) {
    let  alert = await this.alert.create({
    message: error ,
    subHeader: 'Error',
    buttons: ['OK']
  });
  await alert.present(); 
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
 
  this.InitiateOBD();
  //this.RequstData();

}
dataReceived(data)
{
  

  var Ans;
  Ans={};
  //alert("Data Received:- "+JSON.stringify(data));
  var cmd, totalcmds, SingleString,multiVal;
  cmd=this.receivedData+data.toString('utf8');
  //console.log("CMD:  "+cmd);
  totalcmds=cmd.split('>');
  //console.log("TotalCMD:  "+totalcmds+" TotalCMD Length:"+totalcmds.length);

  if(totalcmds.length<2)
    this.receivedData=totalcmds[0];
  else{
    for(let i=0;i<totalcmds.length;i++)
    {
      SingleString=totalcmds[i];
      if(SingleString==='')
        continue;
      //console.log("Single String:  "+SingleString);

      var multipleRes=SingleString.split('\r');
      for(let k=0;k<multipleRes.length;k++)
      {
        multiVal=multipleRes[k];
        if(multiVal==='')
          continue;
        console.log("Multi Val:  "+multiVal);
        //Ans.name=multipleRes.toString().substring(0,4);
       // Ans.value=multipleRes.toString().substring(5,multipleRes.length)
       
        //console.log("Data "+multipleRes+" Count:"+(i++));
        //var Reply;
        //Reply=this.parseCommand(multipleRes);
        //alert("Data Received: "+Reply.value);
        
        this.receivedData='';
        
      }
    } 
  }
  

}
parseCommand(hexString)
{
  var Rep,ValueArray=[];
  Rep={};
  if (hexString === "NO DATA" || hexString === "OK" || hexString === "?" || hexString === "UNABLE TO CONNECT" || hexString === "SEARCHING...") 
  {
    //No data or OK is the response, return directly.
    Rep.value = hexString;
    return Rep;
  }
  //hexString = hexString.replace(/ /g, ''); //Whitespace trimming //Probably not needed anymore?
  for(let k=0;k<hexString.length;k+=2) 
    ValueArray.push(hexString?.substring(k,2));
  if(ValueArray[0]==='41')
  {
    Rep.mode=ValueArray[0];
    Rep.pid=ValueArray[1];
    for(let j=0;j<obdinfo.PIDS.length;j++)
    {
      if(obdinfo.PIDS[j].pid == Rep.pid)
      {
        var byte=obdinfo.PIDS[j].bytes;
        Rep.name=obdinfo.PIDS[j].name;
        switch(byte){
          case 1:
              Rep.value = obdinfo.PIDS[j].convertToUseful(ValueArray[2]);
              break;
          case 2:
              Rep.value = obdinfo.PIDS[j].convertToUseful2(ValueArray[2], ValueArray[3]);
              break;
          case 4:
              Rep.value = obdinfo.PIDS[j].convertToUseful4(ValueArray[2], ValueArray[3], ValueArray[4], ValueArray[5]);
              break;
          case 6:
              Rep.value = obdinfo.PIDS[j].convertToUseful6(ValueArray[2], ValueArray[3], ValueArray[4], ValueArray[5], ValueArray[6], ValueArray[7] );
              break;
      }
      break; //Value is converted, break out the for loop.
  
      }
    }
  }else if(ValueArray[0]==='43')
  {
    Rep.mode=ValueArray[0];
    for (var ij = 0; ij < obdinfo.PIDS.length; ij++) {
      if (obdinfo.PIDS[ij].mode == "03") {
          Rep.name = obdinfo.PIDS[ij].name;
          Rep.value = obdinfo.PIDS[ij].convertToUseful6(ValueArray[1], ValueArray[2], ValueArray[3], ValueArray[4], ValueArray[5], ValueArray[6]);
      }
  }
  }
  return Rep;
     
}
InitiateOBD()
{
  var self=this;
  this.btIntervalWriter=setInterval(function(){
    if(self.queue.length>0 && self.btConnected)
    {
      
      try{
        var cmd=self.queue.shift();
        //console.log("Command: "+cmd);
        self.bluetooth.write(cmd+'\r').then(sk=>{
          
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
  this.presentToast("OBD Setup Completed");  
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
  this.queue=['ATZ\r','ATSP0\r','0100\r'];
  this.SavedCarCommand=[];
  this.RepeatTimer=0;
  clearInterval(this.pollerInterval);
  clearInterval(this.btIntervalWriter)
  this.isModalOpen=false;
  this.bluetooth.disconnect();
  this.presentToast("Bluetooth Disconnected");
}
async  presentToast(msg) {
  let toast = await this.toastctrl.create({
    message: msg,
      duration: 2000,
      position:"top"
  })
  toast.present();
  
  
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