import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DataSrvService} from '../data-srv.service';
import { Car, FirebaseService, LiveData, Setting, Users } from '../firebase.service';
import { ELocalNotificationTriggerUnit, LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  private LiveData:Observable<LiveData[]>;
  private UpdatedLiveData:LiveData={}as LiveData;
  private toggle:any;
  private select=[];
  private SupportedOBD;
  private statement=false;
  private UserID:string;
  private DeleteID:string;
  public User: Observable<Users[]>;//Details about the User will be stored in this variable
  public Car: Observable<Car[]>;//Details about the User will be stored in this variable

  constructor(public DataSrv:DataSrvService,private localNotifications: LocalNotifications,private loading:LoadingController,public router:Router, private Firebase:FirebaseService,private navCtrl:NavController,) { }

  async ngOnInit() 
  {
    this.UserID= await this.DataSrv.GetVariable('userID');
    this.User=this.Firebase.getUsers();
    this.Car=this.Firebase.getCars();
    this.toggle=await this.DataSrv.GetVariable('rem');
    this.SupportedOBD=this.DataSrv.SupportedOBD;
    this.LiveData=this.Firebase.getLiveData();
    this.LiveData.pipe(take(1)).subscribe(res=>{for(let i=0;i<res.length;i++){this.select[i]=res[i].Enabled}},error=>{this.DataSrv.showError("Error",error)})
   
  }
 
  SceduleEveryDay(){
    this.localNotifications.schedule({
      id:0,
      title:'Good Morning',
      text:'Check Your Cars Water & Oil Levels',
      trigger:{every: ELocalNotificationTriggerUnit.DAY}
    });
    
  }

  CancelEveryDay(){
    this.localNotifications.cancel(0);
    
  }

  goback()
  {
    this.navCtrl.back();
  }
  async Apply()
  {
    if(this.toggle)
    {
      await this.SceduleEveryDay();
      this.DataSrv.SetVariable('rem','true').then(r=>
        this.DataSrv.presentToast("Setting Updated")
      );
      
    }else{
      await this.CancelEveryDay();
      this.DataSrv.SetVariable('rem','false').then(r=>
        this.DataSrv.presentToast("Setting Updated")
      );
      
    }
    

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

    this.DataSrv.showChoice("Alert","Sure you want to delete your account?").then( sucess=>
    { 
    if (this.DataSrv.handlerMessage=="confirmed")
    {
      this.User.pipe(take(1)).subscribe(res=>{
        for(let i=0;i<res.length;i++)
        {
          if(this.UserID==res[i].userID)
          {
            this.DeleteID=res[i].ID;
            console.log("ID: "+this.DeleteID);
          }
        }
        this.Firebase.deleteUser(this.DeleteID).then(async rs=>{
          this.Car.pipe(take(1)).subscribe(r=>{
            for(let k=0;k<r.length;k++)
            {
              if(this.UserID==r[k].userId)
              {
                this.DeleteID=r[k].ID;
                console.log("Car ID: "+this.DeleteID);
                this.Firebase.deleteCar(this.DeleteID);
              }
            }
          });
         this.Firebase.DeleteUser().then(rt=>{
          if(rt)
          {
            this.router.navigate(['/login']);
            this.DataSrv.presentToast("Account Deleted Successfully");
          }
         })
         
          
        })
      })
      
      console.log(this.DataSrv.handlerMessage);
      console.log(this.DataSrv.roleMessage);
      //add the code to delete record from firebase and auth. 

    }
    else{
      this.DataSrv.presentToast("Account is not deleted.")

      console.log(this.DataSrv.handlerMessage);
      console.log(this.DataSrv.roleMessage);
    }
  });
}

}
