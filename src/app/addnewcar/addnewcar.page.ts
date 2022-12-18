import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from'@angular/router';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { DataSrvService } from '../data-srv.service';
import { Car, FirebaseService, Users } from '../firebase.service';
import { addDays } from 'date-fns';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { makeStateKey } from '@angular/platform-browser';

@Component({
  selector: 'app-addnewcar',
  templateUrl: './addnewcar.page.html',
  styleUrls: ['./addnewcar.page.scss'],
})


export class AddnewcarPage implements OnInit {
  
  private YearDte=new Date().toISOString();
  private InsDte =new Date().toISOString();
  private YDte:any[];
  private IDte:any[];
  private NotificationID:number[]
  private minDate= new Date().toISOString();
  private newCar:Car={} as Car;
  public User: Observable<Users[]>;
  private UserID;
  private UpdatedUser:Users={}as Users;
  carform: FormGroup;
    constructor(
      private localNotify:LocalNotifications,
      private navCtrl:NavController,
      public router:Router,
      private route:ActivatedRoute,
      public dataSrv:DataSrvService,
      private Firebase:FirebaseService,
      private loading:LoadingController) { 
        this.initForm();


     
       
    }
    goback()
    {
      this.navCtrl.back();
    }
 
  async ngOnInit()
  {
    this.User=this.Firebase.getUsers();
    this.UserID=await this.dataSrv.GetVariable('userID');
    this.User.pipe(take(1)).subscribe(async rez=>{
      for(let u=0;u<rez.length;u++)
      {
        if(this.UserID==rez[u].userID)
        {
          
          this.UpdatedUser=rez[u];
        
          
        }
      }
    })
    this.newCar.blue='Dark';
    this.newCar.userId=this.UserID;
   

  }
  initForm() {
    
    this.carform = new FormGroup({
      make: new FormControl(null, {validators: [Validators.required]}) ,
      ownerID: new FormControl(null, {validators: [Validators.required]}),
      numPlate: new FormControl(null, {validators: [Validators.required]}),
      model: new FormControl(null, {validators: [Validators.required]}),
     });
    }


  async submit()
  {
    
    console.log("Current Inside Notify: "+this.UpdatedUser.Noification);
   if(!this.carform.valid) 
    {this.carform.markAllAsTouched();
      return;
    }
    //saving the form data in array
    this.newCar.make=this.carform.value.make;
    this.newCar.model=this.carform.value.model;
    this.newCar.numPlate=this.carform.value.numPlate;
    this.newCar.ownerID=this.carform.value.ownerID;
   





    this.YDte=this.YearDte.split('T');
    this.IDte=this.InsDte.split('T');
    this.newCar.ExpDte=this.YDte[0];
    this.newCar.InsExp=this.IDte[0];
    this.newCar.VIN=null;
    this.Firebase.addCar(this.newCar).then(suc=>{
      this.NotificationID=[Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 1000000)];
      
      this.newCar.ID=suc.id;
      this.Firebase.updateCar(this.newCar).then(rec=>{

      this.newCar.ExpDte=this.parseDate(this.newCar.ExpDte);
      this.newCar.ExpDte=addDays(this.newCar.ExpDte,-7)
      this.newCar.ExpDte.toLocaleDateString('de-DE');
      console.log("Yearly Inspection 3: "+this.newCar.ExpDte); 

      this.newCar.InsExp=this.parseDate(this.newCar.InsExp);
      this.newCar.InsExp=addDays(this.newCar.InsExp,-7);
      this.newCar.InsExp.toLocaleDateString('de-DE');
      console.log("Yearly Insurance 3: "+this.newCar.InsExp);
      
      this.UpdatedUser.Noification.push(this.NotificationID[0]);
      this.UpdatedUser.Noification.push(this.NotificationID[1]);
      console.log("Notification ID: "+this.UpdatedUser.Noification)
      this.Firebase.updateUser(this.UpdatedUser).then(res=>{
       this.localNotify.schedule([{
          id:this.NotificationID[0],
          title:this.newCar.make+' '+this.newCar.model+' '+this.newCar.year,
          text:'Car Inspection Coming Next Week',
          trigger:{at:this.newCar.ExpDte},
          foreground:true
        },
        {
          id:this.NotificationID[1],
          title:this.newCar.make+' '+this.newCar.model+' '+this.newCar.year,
          text:'Car Insurance Coming Next Week',
          trigger:{at:this.newCar.InsExp},
          foreground:true
        }
      ]);
       })
      
      
      //this.loading.dismiss();
      this.goback();
      this.dataSrv.presentToast("Car Added Successfully");
      })
      
    }).catch(err=>{
      //this.loading.dismiss();
      this.dataSrv.showError("Error ",err);
      this.goback();
    });

    
  }
  parseDate(input) {
    var parts = input.match(/(\d+)/g);
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
  }

}
