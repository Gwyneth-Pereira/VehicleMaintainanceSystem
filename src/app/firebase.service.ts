import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import {Photo} from '@capacitor/camera';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSrvService } from './data-srv.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private updatedCar:Car={ID:'',VIN:'',make:'',model:'',year:null,numPlate:'',carimg:'',ownerID:null,ExpDte:null,InsComp:'',InsPolicy:null, InsType:'',InsExp:null,document:[],userId:'',blue:'danger'};
  private AllCars:Observable<Car[]>;
  public user: Observable<Users[]>;
  private userCollection:AngularFirestoreCollection<Users>;
  
  public car: Observable<Car[]>;
  private carCollection:AngularFirestoreCollection<Car>;

  private SPFlag:Observable<LiveData[]>;//LiveData Database
  private SPFlagCollection:AngularFirestoreCollection<LiveData>;
  constructor(private storage:AngularFireStorage,private androidPermissions:AndroidPermissions,private DataSrv:DataSrvService ,private afs:AngularFirestore,public FireAuth:AngularFireAuth) 
  { 
    
    
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
    this.SPFlagCollection=this.afs.collection<LiveData>('LiveData');
    this.SPFlag= this.SPFlagCollection.snapshotChanges().pipe
    
    (
    map(actions=>{
    return actions.map(a=>{
    const data =a.payload.doc.data();
    const id = a.payload.doc.id;
    return{id,...data};
    });
    })
    );

    this.carCollection=this.afs.collection<Car>('Car');
    this.car= this.carCollection.snapshotChanges().pipe
    
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
  getUsers():Observable<Users[]>{ return this.user;}
  getLiveData():Observable<LiveData[]>{ return this.SPFlag;}

  getCars():Observable<Car[]>
  {  return this.car;  }
  getCar(id: string): Observable<Car>{
    return this.carCollection.doc<Car>(id).valueChanges().pipe(
    map(idea=>{
    idea.userId=id;
    return idea
    })
    );}
  getUser(id: string): Observable<Users>{
    return this.userCollection.doc<Users>(id).valueChanges().pipe(
    map(idea=>{
    idea.userID=id;
    return idea
    })
    );}
  
  async loginUser(newEmail: string, newPassword: string)
  {
    try
    {
      const user =await this.FireAuth.signInWithEmailAndPassword(newEmail,newPassword);
      return user;
    }
    catch(ex)
    {
      return null;
    }
    }
  
  async resetPassword(email: string)
   { 
    try
    {
      const user =await this.FireAuth.sendPasswordResetEmail(email);
      return user;
    }
    catch(ex)
    {
      return null;
    } 
    
  }
  
  logoutUser()
  { return this.FireAuth.signOut();}
  
  signupUser(newEmail: string, newPassword: string):boolean
  { 
    let checker=false;
    this.FireAuth.createUserWithEmailAndPassword(newEmail,newPassword).then(
      success=>{
       checker=true;
      },
      error=>{this.DataSrv.showError("Error",error)});
    return checker;
     
  }
  
  addUser(idea:Users):Promise<DocumentReference>{ return this.userCollection.add(idea); }
  
  addCar(idea:Car):Promise<DocumentReference>{  return this.carCollection.add(idea);   }
  
  updateUser(idea:Users):Promise<void>{return this.userCollection.doc(idea.ID).update(idea);}
  updateCar(idea:Car):Promise<void>{return this.carCollection.doc(idea.ID).update(idea);}
  

  deleteUser(id: string): Promise<void>{return this.userCollection.doc(id).delete();}
  
  async uploadImage(image:Photo,Path:string)
  {
    const response=await fetch(image.webPath);
    const blob=await response.blob();
     this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      async result => 
      { 
      const path =Path+image.format;
      const storageRef=this.storage.ref(path);
      try{
      await this.storage.upload(path,blob);
      const imageURL=await storageRef.getDownloadURL();
      return imageURL;
    }catch(e){
      this.DataSrv.showError("Error",e);
      return null
    }},err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA));
    return null;
  }
  
  
}
export interface Users {
ID?:string;
userID: string;
Name: string;
phoneNum: number;
password: string;
img: string;
licenseExp: Date;

}

export interface Setting{
ID?;
InspR:boolean;
InsuR:boolean;
OilR:boolean;
PairR:boolean;
dailyR:boolean;
}
export interface Car{
ID?:string;
VIN?:string;
make:string;
model:string;
year:number;
numPlate:string;
carimg:string;
ownerID:number;
ExpDte:Date;
InsComp:string;
InsPolicy:number;
InsType:string;
InsExp:Date;
document:any[];
userId:string;
blue:string;
}

export interface LiveData{
Code:string;
Description:string;
Value:boolean;
}