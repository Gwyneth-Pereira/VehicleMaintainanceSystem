import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DataSrvService } from '../data-srv.service';
import { code, FirebaseService, LiveData } from '../firebase.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  private selectedSegment: string ='Sensor';
  private LiveData:Observable<LiveData[]>;
  private CodeArray:string[]=[];
  private TroubleCodes:Observable<code[]>;
  
  Sped;
  constructor(public bluetooth:BluetoothSerial, public router:Router,public DataSrv:DataSrvService,private Firebase:FirebaseService) {
   
  }
  ngOnInit()
   {
    this.TroubleCodes=this.Firebase.getCodes();
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
            this.router.navigate(['tab/tabs/tab2']);
            this.DataSrv.presentToast("Connection Timed Out! Please Pair Again")

          })


      }
      ,error=>
      {
        this.bluetooth.enable();
        this.router.navigate(['tab/tabs/tab2']);
      })
   
  }
  FetchLiveData()
  {
    this.LiveData.pipe(take(1)).subscribe(res=>{
      for(let i=0;i<res.length;i++)
        if(res[i].Enabled)
         this.CodeArray.push(res[i].ID);
         this.DataSrv.LiveDataCmds=this.CodeArray;
         this.bluetooth.isConnected().then(
          res=>{
           this.DataSrv.deviceConnected('01','00');

          },error=>{}
         )
         
    },rej=>{this.DataSrv.showError("Error", "Error Fetching Data")});
   // console.log(this.DataSrv.LiveDataCmds);
    
    
  }
  
}
