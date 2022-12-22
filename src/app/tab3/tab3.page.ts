import { Component, OnInit } from '@angular/core';
import { ELocalNotificationTriggerUnit, LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import {  DataSrvService } from '../data-srv.service';
import {add} from "date-fns";
import { Car, FirebaseService, Users } from '../firebase.service';
import { take } from 'rxjs/operators';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  private CarDetails: Observable<Car[]>;
  private UserID;
  public User: Observable<Users[]>;
  private UpUser:Users={} as Users;
  public Sceduled: any [ ] =[];
  private count=0;

  constructor(private localNotifications: LocalNotifications,
              private DataSrv:DataSrvService,
              private plt:Platform,
              private alertCtrl:AlertController,
              private Firebase:FirebaseService ) 
  {
    
    
    this.CarDetails=this.Firebase.getCars();
    this.plt.ready().then(()=>{
      this.localNotifications.on('click').subscribe(res=>{
        console.log("click"+res);
        let msg=res.data ? res.data.mydata:'';
        //this.DataSrv.showError(res.title,res.text+res.msg);

      });
      this.localNotifications.on('trigger').subscribe(res=>{
        console.log("trigger"+res);
        let msg=res.data ? res.data.mydata:'';
       // this.DataSrv.showError(res.title,res.text+res.msg);
      });
    })
   


  }
  ionViewDidLeave(){
    console.log("destroyed");
    this.CloseDown();
    
  } 
  ionViewWillEnter()
  {
    console.log("Length: "+this.Sceduled.length)
   this.Setup();
   
  }
 ngOnInit() 
  {
    

  }
  deleteNotify(id)
  {
    this.localNotifications.cancel(id).then(r=>{
      let index=this.UpUser.Noification.indexOf(id);
      this.UpUser.Noification.splice(index,1);
      this.Firebase.updateUser(this.UpUser).then(kre=>{
        this.DataSrv.presentToast("Notification Deleted Successfully");
        this.CloseDown();
        this.Setup();
      });
      
    })
  }
  async Setup()
  {
    this.UserID= await this.DataSrv.GetVariable('userID');
    this.User=this.Firebase.getUsers();
    this.User.subscribe(async res=>{
      for(let k=0;k<res.length;k++)
       if(res[k].userID==this.UserID)
        this.UpUser=res[k];
    await this.localNotifications.getAll().then(res=>{
    for(let k=0;k<res.length;k++)
      for(let i=0;i<this.UpUser.Noification.length;i++)
        if(res[k].id===this.UpUser.Noification[i])
          this.Sceduled.push(res[k]);
    }).catch(er=>{this.DataSrv.showError("Error",er);});
    })
   
  }
  del()
  {
    console.log("Call Del");
    
    for(let k=0;k<this.UpUser.Noification.length;k++)
    {
      this.localNotifications.cancel(this.UpUser.Noification[k]).then(res=>
        {
          this.count++;
        })
    }
    this.CloseDown();
    this.Setup();
   if(this.UpUser.Noification.length==this.count)
   {
    this.UpUser.Noification.splice(0);
    this.Firebase.updateUser(this.UpUser).then(kre=>{
      this.DataSrv.presentToast("All Notifications Deleted Successfully");
    });
   }
    
  }
  CloseDown()
  {
    this.Sceduled=[];
  }


}
