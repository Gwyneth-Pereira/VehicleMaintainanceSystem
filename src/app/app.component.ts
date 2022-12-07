import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { DataSrvService } from './data-srv.service';
import { Tab2Page } from './tab2/tab2.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
 
  constructor(platform: Platform,afAuth: AngularFireAuth, private DataSrv:DataSrvService, private router:Router) {
    
  
}

}
