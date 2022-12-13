import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import {Photo} from '@capacitor/camera';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { cide, DataSrvService } from './data-srv.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private updatedCar:Car[]={}as Car[];
  public Codes:code={id:'codes',codes:[]}as code;
  public user: Observable<Users[]>;
  private userCollection:AngularFirestoreCollection<Users>;

  public code: Observable<code[]>;
  private codeCollection:AngularFirestoreCollection<code>;
  
  public car: Observable<Car[]>;
  private carCollection:AngularFirestoreCollection<Car>;

  private SPFlag:Observable<LiveData[]>;//LiveData Database
  private SPFlagCollection:AngularFirestoreCollection<LiveData>;
  //private LiveData:Observable<LiveData[]>;
  private UpdatedLiveData:LiveData={}as LiveData;
  constructor(private storage:AngularFireStorage,private alert: AlertController,private androidPermissions:AndroidPermissions ,private afs:AngularFirestore,public FireAuth:AngularFireAuth) 
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

    this.codeCollection=this.afs.collection<code>('code');
    this.code= this.codeCollection.snapshotChanges().pipe
    
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
  getCodes():Observable<code[]>{ return this.code;}

  getCars():Observable<Car[]>
  {  return this.car;  }
  getCar(id: string): Observable<Car[]>{
    return this.car;}
  //  get_specific_user_cars(uid :string): Observable<Car[]>{
   
  //   return this.carCollection.doc<Car[]>().valueChanges().pipe(
  //   map(idea=>{
  //  idea.forEach(element => { 
  //   if(element.userId==uid)
  //       this.updatedCar.push(element);
  //     });
  //     return Observable(this.updatedCar);
  //   })
    
  //   );
  // return;}

  getUser(id: string): Observable<Users>{
    return this.userCollection.doc<Users>(id).valueChanges().pipe(
    map(idea=>{
    idea.userID=id;
    return idea
    })
    );}
  
  async loginUser(newEmail: string, newPassword: string)
  {
    const user =await this.FireAuth.signInWithEmailAndPassword(newEmail,newPassword);
      return user;
  
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
      error=>{this.showError("Error",error)});
    return checker;
     
  }
  
  addUser(idea:Users):Promise<DocumentReference>{ return this.userCollection.add(idea); }
  
  addCar(idea:Car):Promise<DocumentReference>{  return this.carCollection.add(idea);   }
  
  updateUser(idea:Users):Promise<void>{return this.userCollection.doc(idea.ID).update(idea);}
  updateCar(idea:Car):Promise<void>{return this.carCollection.doc(idea.ID).update(idea);}
  updateLiveData(idea:LiveData):Promise<void>{return this.SPFlagCollection.doc(idea.ID).update(idea);}
  updateCode(idea:code):Promise<void>{return this.codeCollection.doc(idea.id).update(idea);}

  

  deleteUser(id: string): Promise<void>{return this.userCollection.doc(id).delete();}
  removeCodes()
  {
  this.Codes.codes=[];  
  this.updateCode(this.Codes).then(res=>{
                this.showError("Alert","Codes Removed");
              });
  
  }
  removeLiveData()
  {
  this.SPFlag.pipe(take(1)).subscribe(res=>{
    for(let i=0;i<res.length;i++)
    {
      this.UpdatedLiveData=res[i];
      this.UpdatedLiveData.Value=''
      this.updateLiveData(this.UpdatedLiveData).then(happy=>{console.log("Deleted Values");this.UpdatedLiveData={}as LiveData;},sad=>{this.showError("Error",sad)})
    }
  })
  
  }
  updateLiveDataValues(code,result)
{
  this.SPFlag.pipe(take(1)).subscribe(res=>{
    for(let  i=0;i<res.length;i++)
    {
      if(res[i].ID==code)
      {
        this.UpdatedLiveData=res[i];
        this.UpdatedLiveData.Value=result;

      }

    }
    this.updateLiveData(this.UpdatedLiveData).then(happy=>{console.log("Uploaded Result");this.UpdatedLiveData={}as LiveData;},sad=>{this.showError("Error",sad)})

  })
  
}

  
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
      this.showError("Error",e);
      return null
    }},err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA));
    return null;
  }
  async showError(Header,msg) {
    let  alert = await this.alert.create({
    message: msg,
    subHeader: Header,
    buttons: ['OK']
    });
    await alert.present(); 
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
ID?:string;
Code:string;
Description:string;
Value:string;
Enabled:boolean
}
export interface code{
  id?:string;
  codes:cide[]
}