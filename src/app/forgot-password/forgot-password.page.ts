import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataSrvService } from '../data-srv.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  form: FormGroup;

  constructor( public datasrv:DataSrvService) { 
    this.initForm();
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

     //user password reset
    this.datasrv.resetPassword(this.form.value.email);

  }

  ngOnInit() {
  }

}
