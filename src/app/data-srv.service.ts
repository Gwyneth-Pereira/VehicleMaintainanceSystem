import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, map,switchMap,take}from'rxjs/operators';
import { Storage } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {
  queue=['ATZ\r','ATS0\r','ATL0\r','ATSP0\r','0100\r','0902\r'];//Setting Up OBD-II Commands;
  CurrentUser:string='';
  private storageBehaviour = new BehaviorSubject(false);
  index=0;//Index to guide the obd command array to the next point
  private data;
  
  public user: Observable<Users[]>;
  private userCollection:AngularFirestoreCollection<Users>;
  
  public car: Observable<Car[]>;
  private carCollection:AngularFirestoreCollection<Car>;

  private SPFlag:Observable<boolean>;//LiveData Database
  private SPFlagCollection:AngularFirestoreCollection<boolean>;

  private PushingInterval;
  private WritingInterval;
  private LiveDataArray;
  private OBD_Queue:string[];
  
  BluetoothFlag: boolean=true;
  SupportedFlag: boolean=false;
  isModalOpen:boolean=false;//Variable to open and close the modal page
  TroubleCodes:string[];
  recurring: string;
  


  constructor(private afs:AngularFirestore,private storage: Storage, private toastctrl:ToastController,private alert: AlertController, public bluetooth:BluetoothSerial, public afAuth:AngularFireAuth){
    this.TroubleCodes=[];
    this.recurring='0';
    this.LiveDataArray;
    this.ngOnInit();

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

getCars():Observable<Car[]>{  return this.car;  }

getUser(id: string): Observable<Users>{
  return this.userCollection.doc<Users>(id).valueChanges().pipe(
  map(idea=>{
  idea.userID=id;
  return idea
  })
  );}

loginUser(newEmail: string, newPassword: string): Promise<any> { return this.afAuth.signInWithEmailAndPassword(newEmail, newPassword);}

resetPassword(email: string): Promise<void> {   return this.afAuth.sendPasswordResetEmail(email); }

logoutUser(): Promise<void> { return this.afAuth.signOut();}

signupUser(newEmail: string, newPassword: string): Promise<any>{  return this.afAuth.createUserWithEmailAndPassword(newEmail, newPassword); }

addUser(idea:Users):Promise<DocumentReference>{ return this.userCollection.add(idea); }

addCar(idea:Car):Promise<DocumentReference>{  return this.carCollection.add(idea);   }

updateUser(idea:Users):Promise<void>{return this.userCollection.doc(idea.userID).update(idea);}

deleteUser(id: string): Promise<void>{return this.userCollection.doc(id).delete();}

async ngOnInit() {
  console.log('Init Storage');
  await this.storage.defineDriver(CordovaSQLiteDriver);
   await this.storage.create();
   this.storageBehaviour.next(true);
   console.log(' Storage Created');
  
}
async setValue(key: string, value: any) {
  return this.storage.set(key, value);
}
getValues(key) {
  console.log('Get Values Called');
  return this.storageBehaviour.pipe(
    filter(ready=>ready),
    switchMap(_=>{
      console.log('Green Light');
      return from(this.storage.get(key)) || of([]);
    })
  )
  
  
}

InitiateOBD(cmd)
{
  try{
  this.bluetooth.write(cmd+'\r');
  }catch(error){
  this.presentToast("Error Writing OBD-II Command");
  }
}
deviceConnected(mode)
{
this.bluetooth.subscribe('>').subscribe
(success=>{
this.dataReceived(success,mode);
}, error => {
  this.showError("Error During Receivng Data",error);
  this.Disconnect();

});
if(mode=='00')
  this.InitiateOBD(this.queue[this.index++]);
else if(mode=='03')
  this.InitiateOBD('03\r');
if(this.recurring=='1')
  {
  console.log("//Fetch Live Data");
  }
}
Disconnect()
{
  this.BluetoothFlag=true;
  this.index=0;
  this.SupportedFlag=false;
  this.isModalOpen=false;
  this.bluetooth.disconnect();
  this.presentToast("Bluetooth Disconnected");
}


dataReceived(data,mode)
{
  var cmd, totalcmds, SingleString;
  cmd=data.toString('utf8');
  totalcmds=cmd.split('>');
  for(let i=0;i<totalcmds.length;i++)
    {
      SingleString=totalcmds[i];
      if(SingleString==='')
        continue;
      var multipleRes=SingleString.split('\r');
      console.log("Code: "+multipleRes[0]+", Response: "+multipleRes[3])
     
      if(multipleRes[0]==='0902')
      {
        if(multipleRes[3]==='NO DATA')//If the Car Desnt Support Mode 9
          this.showError("Alert","This Car Does not Support Mode 09(Vehicle Identification Number). Hence No Data will be Saved to Cloud")
        else if(multipleRes)//if the VIN from the car (that we get from firebase) has a default value.
        {
          //this is the first time pairing with the car
          //Save the VIN into the database
        }
        else//If the VIN from the car (that we get from firebase) does not match the VIN from the OBD Scan
        {
          this.showError("Error", "Please Connect with the correct Car to Save your Data");
          this.Disconnect();
          
        }  
      }
      if(multipleRes[0]==='03')
      {
        this.TroubleCodes=[];
        if(multipleRes[3]!=='NO DATA')
            {
              SingleString=SingleString.substring(7);
            console.log("Before: "+SingleString)
            let z=0;
            let Jump=0;
            
            while(z<SingleString.length)
            {
              
              if(Jump==3)
              {
                Jump=0;
                z+=3;
               continue; 
              }else{
                Jump++;
                this.TroubleCodes.push(SingleString.substring(z, z + 4));
                z+=4;
              }

            }
            console.log("After codes: "+this.TroubleCodes);
            for(let m=0;m<this.TroubleCodes.length;m++)
            {if(this.TroubleCodes[m]!='0000')
            {
              if(this.TroubleCodes[m].charAt(0)=='9')
              {
                this.TroubleCodes[m]='B1'+this.TroubleCodes[m].slice(1);
              }else if(this.TroubleCodes[m].charAt(0)=='5')
              {
                this.TroubleCodes[m]='C1'+this.TroubleCodes[m].slice(1);
              }else if(this.TroubleCodes[m].charAt(0)=='C')
              {
                this.TroubleCodes[m]='U0'+this.TroubleCodes[m].slice(1);
              }else if(this.TroubleCodes[m].charAt(0)=='D')
              {
                this.TroubleCodes[m]='U1'+this.TroubleCodes[m].slice(1);
              }else
              {
                this.TroubleCodes[m]='P'+this.TroubleCodes[m];
              }

            }else
            {
              this.TroubleCodes.splice(m,1);
              m--;
            }
              
              
            }          
            
    
            }else{
              //console.log("no codes found");
            }
          
        
      }
    }
    if(mode=='00')
    {
      if(this.index<this.queue.length)
        this.InitiateOBD(this.queue[this.index++]);
      else{
        this.presentToast("OBD-II Setup Completed"); 
        this.recurring='1';
      }
     
    } 
   
     
}
FetchLiveData()
  {
     var self=this;
     this.PushingInterval = setInterval(function () 
      {
       try{ 
        for (let i = 0; i < self.LiveDataArray.length; i++) 
        self.queue.push(self.LiveDataArray[i]); 
      }catch{
        self.presentToast("Error Pushing Command catch Block");
        clearInterval(self.PushingInterval);
      } 
      }, 1000);
     
     this.WritingInterval = setInterval(function(){
      if (self.OBD_Queue.length > 0)
        try{
            var cmd=self.OBD_Queue.shift();
            self.InitiateOBD(cmd);
          }catch(error){
            self.presentToast("Error Writing Command catch Block");
            clearInterval(self.WritingInterval);
          }
      
    },1000);
  
    }

async showError(Header,msg) {
  let  alert = await this.alert.create({
  message: msg,
  subHeader: Header,
  buttons: ['OK']
  });
  await alert.present(); 
  }

 public  handlerMessage = '';
 public roleMessage = '';
// alert with choice to confirm delete or abort action.
  async showChoice(Header,msg) {
    let  alert = await this.alert.create({
    message: msg,
    subHeader: Header,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.handlerMessage = 'canceled';
        },
      },
      {
        text: 'OK',
        role: 'confirm',
        handler: () => {
          this.handlerMessage = 'confirmed';
        },
      },
    ]
    });
    await alert.present(); 
    const { role } = await alert.onDidDismiss();
    this.roleMessage = `Dismissed with role: ${role}`;
    }


// popup message alert.
async  presentToast(msg) {
  let toast = await this.toastctrl.create({
  message: msg,
  duration: 2000,
  position:"top"
  })
  toast.present();
  }
}
export interface Users {
  userID?: string;
  Name: string;
  phoneNum: number;
  password: string;
  img: string;
  licenseExp: Date;
  Car:Car[];
  
}

export interface Setting{
  ID?;
  InspR:boolean;
  InsuR:boolean;
  OilR:boolean;
  PairR:boolean;
  dailyR:boolean;
}

export interface paired {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  
}

export interface LiveData{
  "Code":string;
  "Description":string;
  "Value":string;
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
document:string[];
userId:string;
  }
