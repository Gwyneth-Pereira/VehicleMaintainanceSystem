import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from '../firebase.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private FireAuth:AngularFireAuth,private router:Router,private Firebase:FirebaseService)
  {

  }
 
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log("Auth Guard Triggered");
      return new Promise((resolve,reject)=>{
        this.FireAuth.user.subscribe((user)=>
        {
          if(user){
            
            resolve(true);
          }else{
            this.router.navigate(['login']);
            resolve(false);
          }
        })
      })

    
  }
  
}
