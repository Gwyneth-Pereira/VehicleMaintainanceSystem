import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { codesdesc } from '../codedesc';
import { Codes } from '../codes';
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
  public len;
  private CarName;
  private TroubleCodes:Observable<code[]>;
  private leng;
  Sped;
  constructor(public bluetooth:BluetoothSerial,public router:Router,public DataSrv:DataSrvService,private Firebase:FirebaseService) {
   
  }
  ngOnInit()
   {
    this.CarName=this.DataSrv.CarName;
    console.log("Length "+Codes.AllCodes.length);

    this.TroubleCodes=this.Firebase.getCodes();
    this.TroubleCodes.subscribe(res=>{
      this.leng=res.length;
    });
    this.LiveData=this.Firebase.getLiveData();
    this.TroubleCodes.subscribe(sucess=>{
      this.len= sucess[0].codes.length;
    })
   
    //console.log(codesdesc.codedes);



  }
  ClearCodes()
  {
    this.bluetooth.isConnected().then(rsp=>{
      this.DataSrv.deviceConnected('04','00');
      this.Firebase.removeCodes();
    })
  }
  segmentChanged(event : any){
  console.log(event.target.value);
  this.selectedSegment=event.target.value;
  }

  Scan()
  {
    //console.log("Length: "+)
    this.bluetooth.isEnabled().then(resp=>
      {
        this.bluetooth.isConnected().then(rsp=>
          {
            this.DataSrv.deviceConnected('03','00');
            //console.log("Length: "+codesdesc.AllCodes.length)
            this.TroubleCodes.subscribe(res=>{
              for(let i=0;i<res.length;i++)
              {
                console.log("res: "+res[i].codes[i])
                
              }
            },erro=>{this.DataSrv.showError("alert",erro)})
            
           
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
