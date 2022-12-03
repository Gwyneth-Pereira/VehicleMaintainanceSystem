import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router } from'@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable }from'rxjs';
import { CurrentUser, DataSrvService, Users } from '../data-srv.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  currentUser:CurrentUser;
  form: FormGroup;
    constructor(public FBAuth: AngularFireAuth,public router:Router, public toastCtrl:ToastController,public dataSrv:DataSrvService) { 
      this.currentUser={UserID:''};
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
     this.dataSrv.loginUser(this.form.value.email,this.form.value.password).then(
      success => {
       // this.currentUser.ID='Current'
        //this.currentUser.UserID=this.form.value.email;
        //console.log(this.currentUser);
        //this.dataSrv.updateC_User(this.currentUser);
        this.dataSrv.CurrentUser=this.form.value.email;
        this.dataSrv.presentToast("You have logged in sucessfully!!");
        this.router.navigate(['/']); //home
    }, 
      ).catch(error=>{ 
        this.dataSrv.showError("Alert","No account with this email or incorrect password. <br/> please try again.");
        });
    }
  }
