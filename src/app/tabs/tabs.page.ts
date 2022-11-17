import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    const authObserver = afAuth.authState.subscribe(
    user => {
    if (user) {
    alert("User signed in");
    this.router.navigate(['/tabs/tab2']);
    authObserver.unsubscribe();
    } else {
    alert("User signed OUT");
    this.router.navigate(['/login']); //login page
    authObserver.unsubscribe();
    }
    });
  }
}
