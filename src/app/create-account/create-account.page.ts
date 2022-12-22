import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataSrvService} from '../data-srv.service';
import { Router } from '@angular/router';
import { FirebaseService, Users } from '../firebase.service';
import { LoadingController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {
  NewAccount: Users={} as Users;
  form: FormGroup;
  constructor(
    public datasrv:DataSrvService,
    private router: Router, 
    private Firebase:FirebaseService,
    private loading:LoadingController,
    public FireAuth:AngularFireAuth) { 
    this.initForm();
  }

  ngOnInit() {
  }

  initForm() {
    this.form = new FormGroup({
      name: new FormControl(null, {validators: [Validators.required]}),
      email: new FormControl(null, {validators: [Validators.required, Validators.email]}),
      password: new FormControl(null, {validators: [Validators.required, Validators.minLength(8)]}),
      phone: new FormControl(null, {validators: [Validators.required, Validators.minLength(8),Validators.maxLength(8)]}),
    });
  }

  async onSubmit() {
    
    if(!this.form.valid) 
    {
      this.form.markAllAsTouched();
      return;
    }
    const loader=await this.loading.create();
    await loader.present();
    this.NewAccount.userID=this.form.value.email.toLowerCase();
    this.NewAccount.Name= this.form.value.name;
    this.NewAccount.phoneNum = this.form.value.phone ;
    this.NewAccount.password=this.form.value.password;
    this.NewAccount.Noification=[];
    this.NewAccount.Noification.push(0);
    this.FireAuth.createUserWithEmailAndPassword(this.form.value.email,this.form.value.password).then(
      success=>{
      this.Firebase.addUser(this.NewAccount).then( async onfulfilled=>
         { 
          this.NewAccount.ID=onfulfilled.id;
          this.Firebase.updateUser(this.NewAccount).then(async truth=>{
            this.form.reset();
            this.datasrv.presentToast("Account Created Successfully");
            await loader.dismiss();
            this.datasrv.SetVariable('userID',this.NewAccount.userID).then(async rl=>{
            this.datasrv.presentToast("Welcome "+this.NewAccount.Name);
            this.router.navigate(['/login']);
          }); 
            

            });
         },async error=>{
            await loader.dismiss();
            this.datasrv.showError("Error ",error);
            });
             },async error=>{
              await loader.dismiss();
              this.datasrv.showError("Error",error);
              });
   
   
                               }
  }



