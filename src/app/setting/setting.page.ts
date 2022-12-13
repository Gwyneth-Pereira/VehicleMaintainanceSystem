import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DataSrvService} from '../data-srv.service';
import { FirebaseService, LiveData, Setting } from '../firebase.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  private LiveData:Observable<LiveData[]>;
  private UpdatedLiveData:LiveData={}as LiveData;
  private select=[];
  private SupportedOBD;
  private statement=false;
  constructor(public DataSrv:DataSrvService,private loading:LoadingController,public router:Router, private Firebase:FirebaseService,private navCtrl:NavController,) { }

  ngOnInit() 
  {
    this.SupportedOBD=this.DataSrv.SupportedOBD;
    this.LiveData=this.Firebase.getLiveData();
    this.LiveData.pipe(take(1)).subscribe(res=>{for(let i=0;i<res.length;i++){this.select[i]=res[i].Enabled}},error=>{this.DataSrv.showError("Error",error)})
   
  }
  goback()
  {
    this.navCtrl.back();
  }
  async SaveSetting()
  {
    const load3=await this.loading.create();
    await load3.present();
    this.LiveData.pipe(take(1)).subscribe(res=>{
      for(let i=0;i<res.length;i++){
        this.UpdatedLiveData=res[i];
        this.UpdatedLiveData.Enabled=this.select[i];
        this.Firebase.updateLiveData(this.UpdatedLiveData).then(ok=>{
          if(i==res.length-1)
          {
            load3.dismiss();
            this.DataSrv.presentToast("Setting Changed");
            this.router.navigate(['/setting']);
          }
          
        },er=>{load3.dismiss();this.DataSrv.showError("Error",er)})
        }},error=>{load3.dismiss();this.DataSrv.showError("Error",error)});
   
    load3.dismiss();
    console.log(this.select);
  }

  onDelete()
  {

    this.DataSrv.showChoice("Alert","Sure you want to delete your account??").then( sucess=>
    { 
    if (this.DataSrv.handlerMessage=="confirmed")
    {
      console.log(this.DataSrv.handlerMessage);
      console.log(this.DataSrv.roleMessage);
      // add the code to delete record from firebase and auth . 

    }
    else{
      this.DataSrv.presentToast("Account is not deleted.")

      console.log(this.DataSrv.handlerMessage);
      console.log(this.DataSrv.roleMessage);
    }
  });
}

}
