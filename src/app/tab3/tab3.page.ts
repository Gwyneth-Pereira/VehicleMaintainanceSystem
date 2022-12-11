import { Component, OnInit } from '@angular/core';
import { ELocalNotificationTriggerUnit, LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import {  DataSrvService } from '../data-srv.service';
import {add} from "date-fns";
import { Car, FirebaseService } from '../firebase.service';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  private CarDetails: Observable<Car[]>;
  private UserID;
  Sceduled;

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

  }
  del()
  {
    this.localNotifications.cancelAll().then(res=>{
      this.Sceduled.length=0;
    })
    
  }
  SceduleEveryDay(){
    this.localNotifications.schedule({
      id:0,
      title:'Good Morning',
      text:'Check Your Car Water & Oil Levels',
      trigger:{every: ELocalNotificationTriggerUnit.DAY}
    })
  }
  sceduleNotifications()
  {
    
    
    this.CarDetails.subscribe(result=>{
      for(let i=0;i<result.length;i++)
      {
        console.log("data User: "+this.UserID+'Array User:  '+result[i].userId)
        if(result[i].userId==this.UserID)
        {
          let date = new Date(result[i].ExpDte);
          let remindInspection = add(date,{months: -1, });
          let Insdate = new Date(result[i].InsExp);
          let remindInsurance = add(Insdate,{months: -1, });
          console.log("current User: "+i+" "+result[i].make);
          this.localNotifications.schedule({
            id:i,
            title:result[i].make+' '+result[i].model+' '+result[i].year,
            text:'Car Inspection Coming Next Month',
            data:{mydata:'Please get your Car Inspected'},
            trigger:{in:5, unit:ELocalNotificationTriggerUnit.SECOND}
          })
          this.localNotifications.schedule({
            id:i+i,
            title:result[i].make+' '+result[i].model+' '+result[i].year,
            text:'Car Insurance Coming Next Month',
            data:{mydata:'Please get your Car Insured'},
            trigger:{at:new Date()},
            foreground:true
          })
        }
      }
    })
    
  }
  getAll()
  {
    this.localNotifications.getAll().then(res=>
      {
        this.Sceduled=res;
      });


  }

}
