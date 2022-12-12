import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from'@angular/router';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { DataSrvService } from '../data-srv.service';
import { Car, FirebaseService } from '../firebase.service';

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
  private minDate= new Date().toISOString();
  private newCar:Car={ID:'',VIN:'',make:'',model:'',year:null,numPlate:'',carimg:'',ownerID:null,ExpDte:null,InsComp:'',InsPolicy:null, InsType:'',InsExp:null,
    document:[],userId:'',blue:'Dark'};
    getValue;
  form: FormGroup;
    constructor(
      private localNotify:LocalNotifications,
      private navCtrl:NavController,
      public router:Router,
      private route:ActivatedRoute,
      public dataSrv:DataSrvService,
      private Firebase:FirebaseService,
      private loading:LoadingController) { 
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.newCar.userId = this.router.getCurrentNavigation().extras.state.userID;
        }
      });
       
    }
    goback()
    {
      this.navCtrl.back();
    }
 
  ngOnInit(){
   
    }


  async submit()
  {
    const loading=await this.loading.create();
    await loading.present();
    this.YDte=this.YearDte.split('T');
    this.IDte=this.InsDte.split('T');
    this.newCar.ExpDte=this.YDte[0];
    this.newCar.InsExp=this.IDte[0];
    



    this.Firebase.addCar(this.newCar).then(suc=>{

      this.newCar.ID=suc.id;
      this.Firebase.updateCar(this.newCar).then(rec=>{
        this.newCar.ExpDte=this.parseDate(this.newCar.ExpDte);
      this.newCar.ExpDte.setDate(this.newCar.ExpDte.getTime()-7);
      this.newCar.ExpDte.toLocaleDateString('de-DE');
      this.localNotify.schedule({
        id:parseInt(this.newCar.userId),
        title:this.newCar.make+' '+this.newCar.model+' '+this.newCar.year,
        text:'Car Inspection Coming Next Week',
        trigger:{at:this.newCar.ExpDte},
        foreground:true
      });
      this.newCar.InsExp=this.parseDate(this.newCar.InsExp);
      this.newCar.InsExp.setDate(this.newCar.InsExp.getTime()-7);
      this.newCar.InsExp.toLocaleDateString('de-DE');
      this.localNotify.schedule({
        id:parseInt(this.newCar.userId),
        title:this.newCar.make+' '+this.newCar.model+' '+this.newCar.year,
        text:'Car Insurance Coming Next Week',
        trigger:{at:this.newCar.InsExp},
        foreground:true
      });
      this.loading.dismiss();
      this.goback();
      this.dataSrv.presentToast("Car Added Successfully");
      })
      
    }).catch(err=>{
      this.loading.dismiss();
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
