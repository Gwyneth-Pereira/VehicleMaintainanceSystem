import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map,take}from'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {

  public user: Observable<Users[]>;
  private userCollection:AngularFirestoreCollection<Users>;

  public car: Observable<Cars[]>;
  private carCollection:AngularFirestoreCollection<Cars>;

  public curentuser: Observable<CurrentUser[]>;
  private currentuserCollection:AngularFirestoreCollection<CurrentUser>;
  public Support=[{Text:'Monitor status since DTCs cleared',Value:'-'},
                  {Text:'Freeze DTC',Value:'-'},
                  {Text:'Fuel system status',Value:'-'},
                  {Text:'Calculated engine load',Value:'-'},
                  {Text:'Engine coolant temperature',Value:'-'},
                  {Text:'Short term fuel trim (bank 1)',Value:'-'},
                  {Text:'Long term fuel trim (bank 1)',Value:'-'},
                  {Text:'Short term fuel trim (bank 2)',Value:'-'},
                  {Text:'Long term fuel trim (bank 2)',Value:'-'},
                  {Text:'Fuel pressure (gauge pressure)',Value:'-'},
                  {Text:'Intake manifold absolute pressure',Value:'-'},
                  {Text:'Engine speed',Value:'-'},
                  {Text:'Vehicle speed',Value:'-'},
                  {Text:'Timing advance',Value:'-'},
                  {Text:'Intake air temperature',Value:'-'},
                  {Text:'Mass air flow sensor air flow rate',Value:'-'},
                  {Text:'Throttle position',Value:'-'},
                  {Text:'Commanded secondary air status',Value:'-'},
                  {Text:'Oxygen sensors present (2 banks)',Value:'-'},
                  {Text:'Oxygen sensor 1 (voltage)',Value:'-'},
                  {Text:'Oxygen sensor 2 (voltage)',Value:'-'},
                  {Text:'Oxygen sensor 3 (voltage)',Value:'-'},
                  {Text:'Oxygen sensor 4 (voltage)',Value:'-'},
                  {Text:'Oxygen sensor 5 (voltage)',Value:'-'},
                  {Text:'Oxygen sensor 6 (voltage)',Value:'-'},
                  {Text:'Oxygen sensor 7 (voltage)',Value:'-'},
                  {Text:'Oxygen sensor 8 (voltage)',Value:'-'},
                  {Text:'OBD standards the vehicle conforms to',Value:'-'},
                  {Text:'Oxygen sensors present (4 banks)',Value:'-'},
                  {Text:'Auxiliary input status',Value:'-'},
                  {Text:'Run time since engine start',Value:'-'},
                  {Text:'PIDs supported [21 - 40]',Value:'-'}];


  constructor(private afs:AngularFirestore){
    this.userCollection=this.afs.collection<Users>('Car');
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

    this.carCollection=this.afs.collection<Cars>('User');
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
getCars():Observable<Cars[]>{
  return this.car;
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
ID:string;
VIN?:string;
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
  export interface paired {
    "class": number,
    "id": string,
    "address": string,
    "name": string,
    
  }
  export interface obdmetric {
    "metricSelectedToPoll":boolean,
    "name":string,
    "description":string,
    "value":string,
    "unit": string
  }
  export interface support{
    "Text":string;
    "Value":string;
  }
