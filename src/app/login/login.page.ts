import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
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

  showPassword = false;
  PasswordToggle = 'eye';
    username="";
    password="";
    constructor(public FBAuth: AngularFireAuth,public router:Router, public toastCtrl:ToastController,public dataSrv:DataSrvService) { }

  public person: Observable<Users[]>;
  public user :Users={}as Users;

  public c: Observable<CurrentUser[]>;
  public current :CurrentUser={ Username:'',solt:'' };
  ngOnInit(){
    //this.c=this.dService.getCurrentUser();
    this.person=this.dataSrv.getUsers();


    }

  async login()
  {
    if(this.username.length<=0||this.password.length<=0)
    {
      this.showToast("Please Fill the Details")
    }else{
      await this.FBAuth.signInWithEmailAndPassword(this.username,this.password)
      .then(async (response)=> {
        await this.person.subscribe((data)=>{
          for(let i=0;i<data.length;i++)
          {
            if(data[i].email==this.username)
            {this.current.ID='Current';
              this.current.username=this.username;
              this.current.usertype=data[i].type;
           }}});
           await  this.dataSrv.updateC_User(this.current)
      .then(()=>{
        this.showToast('Welcome');
        this.username='';
        this.password=''
        if(this.current.usertype=="NULL")
        {

          this.router.navigate(['customer']);

        }else
        {


          this.router.navigate(['tab/tabs/tab2']);
        }
      },err=>{console.log(err);});


      })
      .catch((err)=>{

      this.showToast(err);




    })

    }


  }

  showToast(msg){
    this.toastCtrl.create({
    message:msg,
    duration:2000,
  position:'middle'}).then(toast=>toast.present());}


}

}
