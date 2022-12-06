import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Car, DataSrvService, Users } from '../data-srv.service';

@Component({
  selector: 'app-carinfo',
  templateUrl: './carinfo.page.html',
  styleUrls: ['./carinfo.page.scss'],
})
export class CarinfoPage implements OnInit {
 public uid:string;
 public User: Observable<Users[]>;//Details about the User will be stored in this variable
 public CAR: Observable<Car[]>;

  constructor(private route: ActivatedRoute,private DataSrv:DataSrvService,private navCtrl:NavController) { }

  goback()
  {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.User=this.DataSrv.getUsers();
    this.CAR=this.DataSrv.getCars();//no comment
   
    this.route.params.subscribe(params => {
      console.log(params['uid'] );
      this.uid=params['uid'];
    });
  
  }

}
