import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, map,switchMap,take}from'rxjs/operators';
import { Storage } from '@ionic/storage';

import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {
  queue=['ATZ\r','ATS0\r','ATL0\r','ATSP0\r','0100\r','0902\r'];//Setting Up OBD-II Commands;
  CurrentUser:string='';
  private storageBehaviour = new BehaviorSubject(false);
  index=0;//Index to guide the obd command array to the next point
  private data;
  private PushingInterval;
  private WritingInterval;
  private LiveDataArray;
 public VehicleIDError={ID:'',Msg:''};
  private OBD_Queue:string[];
  
  BluetoothFlag: boolean=true;
  SupportedFlag: boolean=false;
  isModalOpen:boolean=false;//Variable to open and close the modal page
  public TroubleCodes$:Observable<string[]>;
  TroubleCodes:string[];
  recurring: string;
  


  constructor(private storage: Storage,private androidPermissions:AndroidPermissions, private toastctrl:ToastController,private alert: AlertController, public bluetooth:BluetoothSerial){
    this.TroubleCodes=[];
    this.recurring='0';
    this.LiveDataArray;
    this.ngOnInit();

  }


async ngOnInit() {
  console.log('Init Storage');
 // await this.storage.defineDriver(CordovaSQLiteDriver);
   await this.storage.create();
   this.storageBehaviour.next(true);
   console.log(' Storage Created');
  
}
getTroubleCodes()
{
  return this.TroubleCodes$.toPromise();
}
async setValue(key: string, value: any) {
  return this.storage.set(key, value);
}
  getValues(key) {
  console.log('Get Values Called');
  return this.storageBehaviour.pipe(
    filter(ready=>ready),
    switchMap( _=>{
      console.log('Green Light');
      return  from(this.storage.get(key)) || of([]);
    })
  ).toPromise();
  
  
}

InitiateOBD(cmd)
{
  try{
  this.bluetooth.write(cmd+'\r');
  }catch(error){
  this.presentToast("Error Writing OBD-II Command");
  }
}
async getImage()
{
  const image =await Camera.getPhoto({
    quality:90,
    allowEditing: false,
    resultType:CameraResultType.Uri,
    source:CameraSource.Photos,
  });
  return image;
}

deviceConnected(mode, VIN)
{

this.bluetooth.subscribe('>').subscribe
(success=>{
this.dataReceived(success,mode,VIN);
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
  //={ID:'',Msg:''};
  //this.VehicleIDError=null;
  this.BluetoothFlag=true;
  this.index=0;
  this.SupportedFlag=false;
  this.isModalOpen=false;
  this.bluetooth.disconnect();
}


dataReceived(data,mode,VIN)
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
        {
          this.VehicleIDError={ID:'NO DATA',Msg:"Your Car Doesn't have a Vehicle ID.<br>No Data will be Saved to Firebase"};
          
        }
        else if(VIN === undefined || VIN === null)//if the VIN from the car (that we get from firebase) has a default value.
        {
          this.VehicleIDError={ID:multipleRes[3],Msg:"First Time Pairing.<br> Linking VID with Car"};

        }
        else if(VIN===multipleRes[3])//If the VIN from the car (that we get from firebase) does not match the VIN from the OBD Scan
        {
          this.VehicleIDError={ID:multipleRes[3],Msg:"Linking Successfull"};

          
        }else
        {
          this.VehicleIDError={ID:multipleRes[3],Msg:"Please Connect with the correct Car to Save your Data"};
          
        }  
        this.setValue('VID',this.VehicleIDError);
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
            for(let q=0;q<this.TroubleCodes.length;q++)
            this.TroubleCodes$=of[this.TroubleCodes[q]]        
           // this.TCode=this.fetchModel(this.TroubleCodes);
    
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


async showError(Header,msg) {
  let  alert = await this.alert.create({
  message: msg,
  subHeader: Header,
  buttons: ['OK']
  });
  await alert.present(); 
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

}


export interface paired {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  
}



