import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import {Photo} from '@capacitor/camera';
import { Observable } from 'rxjs';
import { filter, first, map, take } from 'rxjs/operators';
import { cide, DataSrvService } from './data-srv.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AlertController, ToastController } from '@ionic/angular';

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
  constructor(private storage:AngularFireStorage,private toastctrl:ToastController,private alert: AlertController,private androidPermissions:AndroidPermissions ,private afs:AngularFirestore,public FireAuth:AngularFireAuth) 
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
  getSpecificData():Observable<LiveData[]>{ return this.SPFlag.pipe(map(LiveValues=>LiveValues.filter(LiveData=>LiveData.Enabled==true)));}

  getCodes():Observable<code[]>{ return this.code;}

  getCars():Observable<Car[]>
  {  return this.car;  }

  getCar(id: string): Observable<Car[]>{
    return this.car.pipe(map(cars=>cars.filter(car=>car.userId===id)))
  }
 
//    async get_specific_user_cars(id:string){
//      return await this.carCollection.snapshotChanges().pipe( map(ides=> { return ides.filter(ides.)} ));
// }

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
  isLoggedn() {
    return this.FireAuth.authState.pipe(first()).toPromise();
}
   
  addUser(idea:Users):Promise<DocumentReference>{ return this.userCollection.add(idea); }
  
  addCar(idea:Car):Promise<DocumentReference>{  return this.carCollection.add(idea);   }
  
  updateUser(idea:Users):Promise<void>{return this.userCollection.doc(idea.ID).update(idea);}
  updateCar(idea:Car):Promise<void>{return this.carCollection.doc(idea.ID).update(idea);}
  updateLiveData(idea:LiveData):Promise<void>{return this.SPFlagCollection.doc(idea.ID).update(idea);}
  updateCode(idea:code):Promise<void>{
    
    return this.codeCollection.doc(idea.id).update(idea);
  }

  

deleteUser(id: string): Promise<void>{return this.userCollection.doc(id).delete();}

deleteCar(id: string): Promise<void>{return this.carCollection.doc(id).delete();}
removeCodes()
  {
      
    this.updateCode(this.Codes).then(res=>{console.log("Engine Codes Removed");},er=>{console.log("Error: "+er);});
    
     
 
  }
  DeleteUser():Promise<boolean>
  {
    return new Promise((resolve,reject)=>{
      this.FireAuth.currentUser.then(user=>{
        if(user)
        {
          user.delete().then(k=>{
            resolve(true);
          }).catch(k=>resolve(false));
         
        }

        }).catch(k=>resolve(false));
      
    })
   
  }
removeLiveData()
  {
  this.SPFlag.pipe(take(1)).subscribe(res=>{
    for(let i=0;i<res.length;i++)
    {
      this.UpdatedLiveData=res[i];
      this.UpdatedLiveData.Value=''
      this.updateLiveData(this.UpdatedLiveData).then(happy=>{console.log("Deleted Live Data Values");this.UpdatedLiveData={}as LiveData;},sad=>{this.showError("Error",sad)})
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
async showError(Header,msg) 
{
    let  alert = await this.alert.create({
    message: msg,
    subHeader: Header,
    buttons: ['OK']
    });
    await alert.present(); 
}
async  presentToast(msg) {
  let toast = await this.toastctrl.create({
  message: msg,
  duration: 1500,
  position:"top"
  })
  toast.present();
  }
}
export interface Users {
ID?:string;
userID: string;
Name: string;
phoneNum: number;
password: string;
img: string;
Noification: any[];

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
img:string;
}
export interface code{
  id?:string;
  codes:any[];
}