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
  async ngOnInit() 
  {
    this.UserID= await this.DataSrv.GetVariable('userID');
    this.User=this.Firebase.getUsers();
    this.User.pipe(take(1)).subscribe(res=>{
      for(let k=0;k<res.length;k++)
      {
        if(res[k].userID==this.UserID)
        {
          this.UpUser=res[k];
          console.log("Notification Length: "+res[k].Noification.length);
        }

      }
      this.localNotifications.getAll().then(res=>
        {
          
          for(let k=0;k<this.UpUser.Noification.length;k++)
          {
            
            for(let i=0;i<res.length;i++)
            {
              console.log("Notification ID: "+res[i].id);
              if(this.UpUser.Noification[k]==res[i].id)
              {
                this.Sceduled.push(res[i]);
              }
            }
  
          }
        });
    })
   
   

  }
  
  del()
  {
    this.localNotifications.cancelAll().then(res=>{
      this.Sceduled.length=0;
    })
    
  }


}
