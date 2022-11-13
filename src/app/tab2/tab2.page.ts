import { Component } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DataSrvService, Users } from '../data-srv.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  Devices:paired[];
  public person: Observable<Users[]>;
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  constructor(private bluetooth:BluetoothSerial,
              private DataSrv:DataSrvService,
              private action:ActionSheetController,
              private permission:AndroidPermissions, 
              private alert: AlertController) {
   // this.Pair();

  }
  ngOnInit(){
    this.person=this.DataSrv.getUsers();
    
    
    
    }

  Pair()
  {
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
   this.bluetooth.setDeviceDiscoveredListener().subscribe(
    device=>{
      let flag=true;
      this.Devices.forEach(element => {
        if(element.id==device.id)
        { flag=false;  }});
     
        if(flag)
        {
          this.Devices.push({address:device.address,class:device.class,id:device.id,name:device.name});
      
      }
      else{flag=true;} 
      
    },
    error=>
      {alert('Error scan: ' + JSON.stringify(error));});
      this.bluetooth.discoverUnpaired();  
      console.log("After: "+JSON.stringify(this.Devices));
      //alert('Devices: ' + JSON.stringify(this.Devices));
  }
 
/*
  listunPairedDevices() { 
    
    this.bluetooth.setDeviceDiscoveredListener().subscribe(device=>
      {
        alert("Found Device " +JSON.stringify(device));
        this.AddDevice(device);
        
      },
      error=>
      {alert('Error scan: ' + JSON.stringify(error));});  
      this.bluetooth.discoverUnpaired();
      //this.Modal();
    
        
        success.forEach(element => {
        console.log(element);
        this.pairedDevices.push(element);
         if(Array.isArray(this.pairedDevices)&&this.pairedDevices.length)
        {
          this.pairedDevices.push(element);
        }else{
          let statement=true;
          this.pairedDevices.forEach(variable => {
            if(element.address==variable.address)
            {
              statement=false;
            }
            
          });

          if(statement)
          {
            this.pairedDevices.push(element);
          }else{
            statement=true;
          }
          }
           });
       
      //this.bluetooth.setDeviceDiscoveredListener()
      //this.pairedDevices = success;
     
      
  
    //
    //this.checking=false;
    
  }

 */
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
  {
    this.showError("No Address");
    

  }else{
    this.bluetooth.connect(dvc.address).subscribe(success=>
      {this.showError("Connected");},error=>{
        console.log(error);
      })

  }
    

 
}
}
interface paired {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  
}