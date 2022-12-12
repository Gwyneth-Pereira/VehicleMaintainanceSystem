import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, map,switchMap,take}from'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { FirebaseService } from './firebase.service';
//import { FirebaseService} from './firebase.service';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {
  public car_name_as_on_slide:string="";
  queue=['ATZ\r','ATS0\r','ATL0\r','ATSP0\r','0100\r','0902\r'];//Setting Up OBD-II Commands;
  LiveDataCmds=[];
  QueueIndex=0;//Index to guide the obd command array to the next point
  LiveDataIndex=0;
  public VehicleIDError='';
  TroubleCodes:string[];
  
  


  constructor(private androidPermissions:AndroidPermissions,public Firebase:FirebaseService, private toastctrl:ToastController,private alert: AlertController, public bluetooth:BluetoothSerial){
    this.TroubleCodes=[];
    
    
    

  }


async ngOnInit() {
  
  
}

async SetVariable(k: string, val: any) {
    await Preferences.set({
      key:k,
      value: val
    });
}

  async GetVariable(k)
  {
    const ret=await Preferences.get({key:k});
    return ret.value;
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
  this.InitiateOBD(this.queue[this.QueueIndex++]);
else if(mode=='03')
  this.InitiateOBD('03\r');
else if(mode=='01')
  this.InitiateOBD(this.LiveDataCmds[this.LiveDataIndex++]);

  
}
Disconnect()
{
 
  this.QueueIndex=0;
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
      console.log("Whole Code: "+SingleString+",");

      console.log("Code: "+multipleRes[0].substring(0,2)+", Res 1: "+multipleRes[1]+", Res 2: "+multipleRes[2]+", Res 3: "+multipleRes[3])
     
      if(multipleRes[0]==='0902')
      {
        //If the Car Desnt Support Mode 9
        if(multipleRes[3]==='NO DATA')this.VehicleIDError="Your Car Returned No Data From OBD-2 Command.<br>No Data will be Saved to Firebase";
        //if the VIN from the car (that we get from firebase) has a default value.
        else if((VIN === undefined || VIN === null)&&multipleRes[3]!=='NO DATA')          this.VehicleIDError="First Time Pairing.<br> Linking VID with Car";
       //If the VIN from the car (that we get from firebase) does not match the VIN from the OBD Scan
        else if(VIN===multipleRes[3])  this.VehicleIDError="Linking Successfull";  
        else  this.VehicleIDError="Please Connect with the correct Car to Save your Data";
        this.SetVariable('VID',this.VehicleIDError);
        
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
            this.TroubleCodes=of[this.TroubleCodes[q]]        
           // this.TCode=this.fetchModel(this.TroubleCodes);
    
            }else{
              //console.log("no codes found");
            }
          
        
      }
      else if(multipleRes[0].substring(0,2)==='01')
      {
        if(multipleRes[0]=='0103')
          {
            var reply = {byteA:0,byteB:0};
            var byteA=multipleRes[2].substring(0,2);
            var byteB=multipleRes[2].substring(2,);
            reply.byteA = parseInt(byteA, 2);
            if(byteB)
            reply.byteB = parseInt(byteB, 2);
            this.Firebase.updateLiveDataValues(multipleRes[0],reply.byteA);     
    
              
          }
        
      }
    }
    if(mode=='00')
    {
      if(this.QueueIndex<this.queue.length)
        this.InitiateOBD(this.queue[this.QueueIndex++]);
      else{
        this.presentToast("OBD-II Setup Completed"); 
       
      }
     
    }else if(mode=='01')
    {
      if(this.LiveDataIndex<this.LiveDataCmds.length)
        this.InitiateOBD(this.LiveDataCmds[this.LiveDataIndex++]);
      else{
        this.LiveDataIndex=0;
       
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



