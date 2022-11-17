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

  form: FormGroup;

  constructor( public datasrv:DataSrvService,private router: Router) { 
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

  onSubmit() {
    if(!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value['email']);
     console.log( this.form.value.email );

     //user login
     this.datasrv.loginUser(this.form.value.email,this.form.value.password).then(
      success => { console.log("logged in sucessfully");
                    this.router.navigate(['/']); //home
                  }, 
      ).catch(error=>{ console.log("user already logged in ");});
  }

 
}