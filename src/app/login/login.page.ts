import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router } from'@angular/router';
import { ToastController } from '@ionic/angular';
import {  Observable }from'rxjs';
import {  DataSrvService, Setting, Users } from '../data-srv.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  
  settng:Setting={InspR:true, InsuR:true, OilR:true, PairR:true, dailyR:true};
  form: FormGroup;
  
    constructor(public FBAuth: AngularFireAuth,public router:Router, public toastCtrl:ToastController,public dataSrv:DataSrvService) { 
      
      this.initForm();
    }

 
  ngOnInit(){
    }
    initForm() {
      this.form = new FormGroup({
        email: new FormControl(null, {validators: [Validators.required, Validators.email]}),
        password: new FormControl(null, {validators: [Validators.required, Validators.minLength(8)]}),
      });
    }

    onSubmit() {
      if(!this.form.valid) {
        this.form.markAllAsTouched();
        return;
      }
      //user login
      console.log('ID: '+this.form.value.email+', Pass: '+this.form.value.password);
      
      this.dataSrv.loginUser(this.form.value.email,this.form.value.password).then(
      success => {
        this.dataSrv.setValue('userID',this.form.value.email);        ;
        this.dataSrv.setValue('setting',this.settng);
        //this.dataSrv.getValues('userID').then((res)=>{console.log('User ID: '+res)})
        this.dataSrv.presentToast("You have logged in sucessfully!!");
        this.router.navigate(['/']); //home
        
         
        
        
    }, 
      ).catch(error=>{ 
        console.log(error)
        this.dataSrv.showError("Alert"," No account with this email or incorrect password. <br/> please try again.");
        });
    }
  }
