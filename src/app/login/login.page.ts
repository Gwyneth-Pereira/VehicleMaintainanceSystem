import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router } from'@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable }from'rxjs';
import { CurrentUser, DataSrvService, Users } from '../data-srv.service';
//import {DataService,Users}from'src/app/data-srv.service';
//import {currentUser}from'src/app/data-srv.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

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
      console.log(this.form.value);
    }
      

  

}
