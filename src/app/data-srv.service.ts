import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map,take}from'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {
  
  public user: Observable<Users[]>;
  private userCollection:AngularFirestoreCollection<Users>;
  public curentuser: Observable<CurrentUser[]>;
  private currentuserCollection:AngularFirestoreCollection<CurrentUser>;
  public loguser: Observable<loginUser[]>;

  constructor(private afs:AngularFirestore, public afAuth:AngularFireAuth){
    this.userCollection=this.afs.collection<Users>('User');
    this.user= this.userCollection.snapshotChanges().pipe
    
    (
    map(actions=>{
    return actions.map(a=>{
    const data =a.payload.doc.data();
    const id = a.payload.doc.id;
    return{id,...data};
    });
    })
    );

    this.currentuserCollection=this.afs.collection<CurrentUser>('CurrentUser');
    this.curentuser= this.currentuserCollection.snapshotChanges().pipe
    (
    map(actions=>{
    return actions.map(a=>{
    const data =a.payload.doc.data();
    const id = a.payload.doc.id;
    return{id,...data};
    });
    })
    );
  }

getUsers():Observable<Users[]>{
return this.user;
}






//the login logout auth
loginUser(newEmail: string, newPassword: string): Promise<any> {
  return this.afAuth.signInWithEmailAndPassword(newEmail, newPassword);
  }

resetPassword(email: string): Promise<void> {
 return this.afAuth.sendPasswordResetEmail(email);
}

logoutUser(): Promise<void> {
  return this.afAuth.signOut();
}
signupUser(newEmail: string, newPassword: string): Promise<any>
{
  return this.afAuth.createUserWithEmailAndPassword(newEmail, newPassword);
}




getCurrentUser():Observable<CurrentUser[]>{
return this.curentuser;
}

getUser(id: string): Observable<Users>{
return this.userCollection.doc<Users>(id).valueChanges().pipe(
map(idea=>{
idea.userID=id;
return idea
})
);
}
addUser(idea:Users):Promise<DocumentReference>{
return this.userCollection.add(idea); 
}
updateUser(idea:Users):Promise<void>{
return this.userCollection.doc(idea.userID).update(idea);
}
updateC_User(idea:CurrentUser):Promise<any>{
  return this.currentuserCollection.doc(idea.ID).update(idea);
}



deleteUser(id: string): Promise<void>{
return this.userCollection.doc(id).delete();
}

}
export interface loginUser
{
   username:string;
   password: string;
  
}
export interface Users {
  userID?: string;
  Name: string;
  phoneNum: number;
  password: string;
  img: string;
  licenseExp: Date;
  Car:Cars[];
  
}
export interface Cars{
make:string;
model:string;
year:string;
numPlate:string;
engCap:string;
ChasisNum:string;
Typeimg:string;
passExpDte:Date;
Insurance:Ins[];
document:string[];

}
export interface Ins{
comName:string;
policyNum:string;
CprNm:number;
ExpDate:string;
  }

  export interface CurrentUser{
    ID?:string;
    Username: string;
    solt:string;

  }