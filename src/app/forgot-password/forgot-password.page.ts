import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataSrvService } from '../data-srv.service';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  form: FormGroup;

  constructor(private Firebase:FirebaseService, private DataSrv: DataSrvService,private router:Router) { 
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({email: new FormControl(null, {validators: [Validators.required, Validators.email]})});
  }

  onSubmit() {
    if(!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.Firebase.resetPassword(this.form.value.email).then(succ=>{
      this.DataSrv.presentToast('Reset Code Sent Successfully');
      this.router.navigate(['/login']);},
      error=>{this.DataSrv.presentToast(error);});

  }

  ngOnInit() {
  }

}
