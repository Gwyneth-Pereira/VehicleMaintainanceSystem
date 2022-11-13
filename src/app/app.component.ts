import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Platform } from '@ionic/angular';
import { Tab2Page } from './tab2/tab2.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  

  rootPage:any;
  constructor(platform: Platform,afAuth: AngularFireAuth) {
    const authObserver = afAuth.authState.subscribe(
        user => {
        if (user) {
        this.rootPage = Tab2Page;
        authObserver.unsubscribe();
        } else {
                    this.rootPage = 'LoginPage';
                  authObserver.unsubscribe();
                }
      });
}
}
