import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from'@angular/router';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { NavController, ToastController } from '@ionic/angular';
import { Car, DataSrvService } from '../data-srv.service';

@Component({
  selector: 'app-addnewcar',
  templateUrl: './addnewcar.page.html',
  styleUrls: ['./addnewcar.page.scss'],
})


export class AddnewcarPage implements OnInit {
  private YearDte;
  private InsDte;
  private minDate= new Date().toISOString();
  private newCar:Car={ID:'',VIN:'',make:'',model:'',year:null,numPlate:'',carimg:'',ownerID:null,ExpDte:null,InsComp:'',InsPolicy:null, InsType:'',InsExp:null,
    document:[],userId:''};
    getValue;
  form: FormGroup;
    constructor(public FBAuth: AngularFireAuth,private localNotify:LocalNotifications ,private navCtrl:NavController,public router:Router,private route:ActivatedRoute, public toastCtrl:ToastController,public dataSrv:DataSrvService) { 
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
   // this.getValue=this.acroute.snapshot.paramMap.get("ID");
   // console.log(JSON.parse(this.getValue));
    }


  submit()
  {
    this.YearDte=this.YearDte.split('T');
    this.InsDte=this.InsDte.split('T');
    this.newCar.ExpDte=this.YearDte[0];
    this.newCar.InsExp=this.InsDte[0];
     console.log(this.YearDte[0]);
     this.dataSrv.addCar(this.newCar).then(suc=>{
      this.newCar.ExpDte.setDate(this.newCar.ExpDte.getTime()-7);
      this.newCar.ExpDte.toLocaleDateString('de-DE');
      this.localNotify.schedule({
        id:parseInt(this.newCar.userId),
        title:this.newCar.make+' '+this.newCar.model+' '+this.newCar.year,
        text:'Car Inspection Coming Next Week',
        trigger:{at:this.newCar.ExpDte},
        foreground:true
      });
      this.newCar.InsExp.setDate(this.newCar.InsExp.getTime()-7);
      this.newCar.InsExp.toLocaleDateString('de-DE');
      this.localNotify.schedule({
        id:parseInt(this.newCar.userId),
        title:this.newCar.make+' '+this.newCar.model+' '+this.newCar.year,
        text:'Car Insurance Coming Next Week',
        trigger:{at:this.newCar.InsExp},
        foreground:true
      });
      this.router.navigate(['tabs/tab2']);
      this.dataSrv.presentToast("Car Added Successfully");
    }).catch(err=>{
      this.dataSrv.showError("Error ",err);
      this.router.navigate(['tabs/tab2']);
    });

    
  }

}
