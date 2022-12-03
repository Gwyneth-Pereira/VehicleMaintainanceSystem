import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Car, DataSrvService, Users } from '../data-srv.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {
  NewAccount: Users={userID:null,Name:null, phoneNum:null, password:null, img:'',licenseExp:null,Car:[]};
  form: FormGroup;
  constructor(public datasrv:DataSrvService,private router: Router) { 
    this.initForm();
  }

  ngOnInit() {
  }

  initForm() {
    this.form = new FormGroup({
      name: new FormControl(null, {validators: [Validators.required]}),
      licenseExp: new FormControl(null),
      imag: new FormControl(null),
      email: new FormControl(null, {validators: [Validators.required, Validators.email]}),
      password: new FormControl(null, {validators: [Validators.required, Validators.minLength(8)]}),
      phone: new FormControl(null, {validators: [Validators.required, Validators.minLength(8),Validators.maxLength(8)]}),
    });
  }

  



  onSubmit() {
    if(!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.NewAccount.userID=this.form.value.email;
    this.NewAccount.Name= this.form.value.name;
    this.NewAccount.phoneNum = this.form.value.phone ;
    this.NewAccount.password=this.form.value.password;
    
    this.datasrv.signupUser(this.form.value.email,this.form.value.password ).then(
      success => { 
      this.datasrv.addUser(this.NewAccount).then( 
      onfulfilled=> { 
        this.datasrv.presentToast("created account sucessfully ");
        console.log(this.NewAccount);
        this.router.navigate(['/login']); //go to homepage });
           }, ).catch(err => { 
            this.datasrv.showError("Error ",err);
           });
      }).catch(
          error => { 
                this.datasrv.showError("Error ",error+"Existing account with this email. <br/> please use another email address.");
               });

    
  
    }
  }



