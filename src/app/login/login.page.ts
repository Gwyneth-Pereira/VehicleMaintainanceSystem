import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NavigationExtras, Router } from'@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import {  Observable }from'rxjs';
import {  DataSrvService } from '../data-srv.service';
import { FirebaseService, Setting } from '../firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  
  settng:Setting={InspR:true, InsuR:true, OilR:true, PairR:true, dailyR:true};
  form: FormGroup;
  
    constructor(public router:Router,public dataSrv:DataSrvService, private Firebase: FirebaseService,private loading:LoadingController) 
    { 
      
      this.initForm();
    }
  ngOnInit() {
    
  }
    initForm() {
      this.form = new FormGroup({
        email: new FormControl(null, {validators: [Validators.required, Validators.email]}),
        password: new FormControl(null, {validators: [Validators.required, Validators.minLength(8)]}),
      });
    }

    async onSubmit() {
      const load1=await this.loading.create();
      await load1.present();
      if(!this.form.valid) {
        this.form.markAllAsTouched();
        await load1.dismiss();
        return;
      }
      this.Firebase.loginUser(this.form.value.email,this.form.value.password).then(
        succ=>{
          this.dataSrv.presentToast("You have logged in sucessfully!!");
          this.dataSrv.SetVariable('userID',this.form.value.email.toLowerCase());
        this.router.navigate(['tab/tabs/tab2']); 
        },error=>{this.dataSrv.showError("Error",error);}).catch(error=>{this.dataSrv.showError("Error",error);})
      await load1.dismiss();
      }
  }
