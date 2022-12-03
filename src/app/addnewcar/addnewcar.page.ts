import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from'@angular/router';
import { ToastController } from '@ionic/angular';
import { Car, DataSrvService } from '../data-srv.service';

@Component({
  selector: 'app-addnewcar',
  templateUrl: './addnewcar.page.html',
  styleUrls: ['./addnewcar.page.scss'],
})


export class AddnewcarPage implements OnInit {
  private YearlyInsDte;
  private InsExpDte;
  private newCar:Car={ID:'',VIN:'',make:'',model:'',year:0,numPlate:'',carimg:'',ownerID:0,ExpDte:'',InsComp:'',InsPolicy:0, InsType:'',InsExp:'',
    document:[],userId:''};
    getValue;
  form: FormGroup;
    constructor(public FBAuth: AngularFireAuth,public router:Router, public toastCtrl:ToastController,public dataSrv:DataSrvService) { 
    this.newCar.userId='abdaal';
   
    }

 
  ngOnInit(){
   // this.getValue=this.acroute.snapshot.paramMap.get("ID");
   // console.log(JSON.parse(this.getValue));
    }


  submit()
  {
    this.YearlyInsDte=this.YearlyInsDte.split('T');
    this.InsExpDte=this.InsExpDte.split('T');
    this.newCar.ExpDte=this.YearlyInsDte[0];
    this.newCar.InsExp=this.InsExpDte[0];
     console.log(this.YearlyInsDte[0]);
    this.dataSrv.addCar(this.newCar).then(suc=>{
      this.router.navigate(['tabs/tab2']);
      this.dataSrv.presentToast("Car Added Successfully");
    }).catch(err=>{
      this.dataSrv.showError("Error ",err);
      this.router.navigate(['tabs/tab2']);
    });

    
  }

}
