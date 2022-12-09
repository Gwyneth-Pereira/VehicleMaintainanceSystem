import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Observable } from '@firebase/util';
import { DataSrvService } from '../data-srv.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  private selectedSegment: string ='Sensor';
  Codes:Observable<string[]>;
  
  Sped;
  constructor(public bluetooth:BluetoothSerial, public router:Router,public DataSrv:DataSrvService) {
   
  }
  ngOnInit()
   {
  }

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
            this.DataSrv.deviceConnected('03','00');
           
          }
          ,er=>
          {
            this.router.navigate(['tabs/tab2']);
            this.DataSrv.presentToast("Connection Timed Out! Please Pair Again")

          })


      }
      ,error=>
      {
        this.bluetooth.enable();
        this.router.navigate(['tabs/tab2']);
      })
   
  }
  
}
