import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map,take}from'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {
  queue=['ATZ\r','ATS0\r','ATL0\r','ATSP0\r','0100\r','0902\r'];//Setting Up OBD-II Commands;
  SupportedOBD=[{Text:'Monitor status since DTCs cleared',Value:'-'},
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
  {Text:'PIDs supported [21 - 40]',Value:'-'}];//An Array that Contains all the data related to 0100 Response
  SupportedPIDS;//Decimal Response Converted from Hex response that came from OBD
  index=0;//Index to guide the obd command array to the next point
  public user: Observable<Users[]>;
  private userCollection:AngularFirestoreCollection<Users>;

  public car: Observable<Cars[]>;
  private carCollection:AngularFirestoreCollection<Cars>;

  public curentuser: Observable<CurrentUser[]>;
  private currentuserCollection:AngularFirestoreCollection<CurrentUser>;
  public Support
  BluetoothFlag: boolean=true;
  SupportedFlag: boolean=false;
  isModalOpen:boolean=false;//Variable to open and close the modal page
  TroubleCodes:string[];

  constructor(private afs:AngularFirestore, private toastctrl:ToastController,private alert: AlertController, public bluetooth:BluetoothSerial){
    this.TroubleCodes=[];
    
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
if(mode=='01')
  this.InitiateOBD(this.queue[this.index++]);
else if(mode=='03')
  this.InitiateOBD('03\r');

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
      if(multipleRes[0]==='0100')
      {
        this.SupportedPIDS=multipleRes[3].toString();
        this.SupportedPIDS=this.SupportedPIDS.substring(4);
        this.SupportedPIDS= (parseInt(this.SupportedPIDS,16)).toString(2);
        for(let k=0;k<this.SupportedOBD.length;k++)
        {
          if(this.SupportedPIDS.charAt(k)=='1')
            this.SupportedOBD[k].Value="Yes";
          else
          this.SupportedOBD[k].Value="No";
        }
        
      }
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
            SingleString=SingleString.substring(7);
            for (let z = 0; z < SingleString.length;z += 4) 
            {
              this.TroubleCodes.push(SingleString.substring(z, z + 4));
              console.log("trouble: "+this.TroubleCodes);

              //Create an if statement to check if the first two values are 43 if yes skip them
            }
           
          
        
      }
      
      
    }
    if(mode=='01')
    {
      if(this.index<this.queue.length)
      this.InitiateOBD(this.queue[this.index++]);
      else
     this.presentToast("OBD-II Setup Completed"); 
    } 
   
     
}

async showError(Header,msg) {
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
