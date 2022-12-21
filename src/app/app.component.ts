import { Component, OnInit, Optional } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataSrvService } from './data-srv.service';
import { Tab2Page } from './tab2/tab2.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  subs:Subscription;
  constructor(public platform: Platform,@Optional() private routerOutlet?:IonRouterOutlet) 
  {
   
    
  
}
exitApp()
{
  console.log("Exit App");
}

ngOnInit()
  {   
   
  }
 
}
