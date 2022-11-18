import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { DataSrvService } from '../data-srv.service';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private afAuth: AngularFireAuth, private router: Router, private dataSrv : DataSrvService) {
    const authObserver = afAuth.authState.subscribe(
    user => {
    if (user) {
    this.dataSrv.showError("Alert","User signed in");  
    this.router.navigate(['/tabs/tab2']);//homepage 
    authObserver.unsubscribe();
    } 
    else {
    this.dataSrv.showError("Alert","User signed OUT");
    this.router.navigate(['/login']); //login page
    authObserver.unsubscribe();
    }
    });
  }
}
