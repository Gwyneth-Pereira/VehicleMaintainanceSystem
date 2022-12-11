import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Observable } from 'rxjs';
import { DataSrvService } from '../data-srv.service';
import { FirebaseService, LiveData } from '../firebase.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  private selectedSegment: string ='Sensor';
  private LiveData:Observable<LiveData[]>;
  private CodeArray:string[]=[];

  
  Sped;
  constructor(public bluetooth:BluetoothSerial, public router:Router,public DataSrv:DataSrvService,private Firebase:FirebaseService) {
   
  }
  ngOnInit()
   {
   
    this.LiveData=this.Firebase.getLiveData();
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
  FetchLiveData()
  {
    this.LiveData.subscribe(res=>{
      for(let i=0;i<res.length;i++)
        if(res[i].Enabled)
         this.CodeArray.push(res[i].ID)
         this.DataSrv.LiveDataCmds=this.CodeArray;
         this.bluetooth.isConnected().then(
          res=>{
           this.DataSrv.deviceConnected('01','00');

          },error=>{}
         )
         
    },rej=>{this.DataSrv.showError("Error", "Error Fetching Data")});
    
    
  }
  
}
