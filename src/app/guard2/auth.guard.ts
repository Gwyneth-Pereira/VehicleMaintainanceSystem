import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
 constructor(private router:Router,private Firebase:FirebaseService){
  console.log("In Constructor");
 }
 async canActivate(): Promise<boolean | UrlTree>  {
    console.log('AuthStateGuard has run');

        if (!await this.Firebase.isLoggedn()) return true;

        return this.router.parseUrl('tabs');
  }
  
}
