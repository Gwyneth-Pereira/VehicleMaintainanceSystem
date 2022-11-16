import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { DataSrvService } from '../data-srv.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  private selectedSegment: string ='Sensor';
  constructor(public bluetooth:BluetoothSerial, public router:Router,public DataSrv:DataSrvService) {}

  segmentChanged(event : any){
  console.log(event.target.value);
  this.selectedSegment=event.target.value;
  }

  Scan()
  {
    this.bluetooth.isEnabled().then(resp=>
      {
        this.bluetooth.isConnected().then(rsp=>
          {
            this.DataSrv.deviceConnected('03');
          }
          ,er=>
          {
            console.log("commd dff")

          })


      }
      ,error=>
      {
        this.bluetooth.enable();
        this.router.navigate(['tabs/tab2']);
      })
   
  }
}
