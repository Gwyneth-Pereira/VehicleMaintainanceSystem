import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Cars, DataSrvService, Users } from '../data-srv.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {
 
   
  /**  
   * userID?: string =null ; 
  public Name: string =null ;
  phoneNum: number;
  password: string =null ;
  img: string =null ;
  licenseExp: Date =null ;; 
  Car:Cars[] =null ;
   */
   
  acc: Users =null;

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
    //the user details 
    this.acc.userID=" ";
    this.acc.Name= " ";
    this.acc.phoneNum =0 ;
    this.acc.img= " ";
    this.acc.licenseExp=null;
    this.acc.Car=[];
    this.acc.password=" ";
    this.acc.userID=this.form.value.email;
    this.acc.Name= this.form.value.name;
    this.acc.phoneNum = this.form.value.phone ;
    this.acc.img= null;
    this.acc.licenseExp=null;
    this.acc.Car=null;
    this.acc.password=this.form.value.passsword;

   //a  =[ {'userID' : this.form.value.email}, { 'name': this.form.value.name}];

   
    //add record in the auth database.
    this.datasrv.signupUser(this.form.value.email,this.form.value.password ).then(
      success => { 
       // add data in the firebase datastore 
       console.log(this.acc);
       this.datasrv.addUser(this.acc).then( onfulfilled=> { 
                      this.datasrv.presentToast("created account sucessfully ");
                      //this.router.navigate(['/']); //go to homepage });

        
                  }, );
                }
      ).catch(
     error => { 
                this.datasrv.showError("Error ","Existing account with this email. <br/> please use another email address.");
               });

    
  
    }
  }



