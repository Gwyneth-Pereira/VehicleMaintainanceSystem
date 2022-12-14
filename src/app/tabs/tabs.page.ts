import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { DataSrvService } from '../data-srv.service';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  constructor(private afAuth: AngularFireAuth,public platform:Platform, private router: Router, private dataSrv : DataSrvService) {
    
  }
  ngOnInit()
  {
  
    
  
  }
  
  Closing()
  {
    console.log("Going Back");
  }
}
