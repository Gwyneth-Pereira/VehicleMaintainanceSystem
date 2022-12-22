import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, IonSlides, ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Car, code, FirebaseService } from './firebase.service';
import { codesdesc } from './codedesc';
import { Codes } from './codes';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {
  public checkedalready: boolean=false;//for tap to scan button
  public live_data_fetched_already: boolean=false;// for fetch  live data button

  public CarName:string="Car not Paired";
  queue=['ATZ\r','ATS0\r','ATL0\r','ATSP0\r','0100\r','0902\r'];//Setting Up OBD-II Commands;
  LiveDataCmds=[];
  private storageReady=new BehaviorSubject(false);
  index;
  BluetoothFlag:boolean=true;
  QueueIndex=0;//Index to guide the obd command array to the next point
  LiveDataIndex=0;
  public VehicleIDError='';
  public Codes:code={id:'codes',codes:[]}as code;
  TroubleCodes:string[];
  public codeWithDesc:cide={}as cide;
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
  
  


  constructor(private androidPermissions:AndroidPermissions, public Firebase:FirebaseService, private toastctrl:ToastController,private alert: AlertController, public bluetooth:BluetoothSerial){
    
    
    
    

  }


async ngOnInit() {
 
  
}

async SetVariable(k: string, val: any) {
   await Preferences.set({
      key:k,
      value: val
    });
   
}

  async GetVariable(k):Promise<string>
  {
    const ret=await Preferences.get({key:k});
    return ret.value;
   
     
  }
  async RemoveVariable(k)
  {
    const ret=await Preferences.remove({key:k});
    console.log("Ret: "+ret)
    return ret;
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
UpdateCar(UpCar:Car,color:string)
{
  UpCar.blue=color;
  this.Firebase.updateCar(UpCar).then(r=>
     {console.log("Updated Car Color to "+color);},
  e=>{ console.log("Error Updating Car Color to "+color); this.showError('Error',e)})
  

}
deviceConnected(mode, VIN)
{
this.BluetoothFlag=false;
this.bluetooth.subscribe('>').subscribe
(success=>{
this.dataReceived(success,mode,VIN);
}, error => {
  this.showError("Error During Receivng Data",error);
  //this.Disconnect();

});
if(mode=='00')
  this.InitiateOBD(this.queue[this.QueueIndex++]);
else if(mode=='03')
  this.InitiateOBD('03\r');
else if(mode=='01')
{
  let val=this.LiveDataCmds.splice(0,1);
  console.log("Wrote Code: "+val)
  this.InitiateOBD(val);
}else if(mode=='04')
{
  this.InitiateOBD('04\r');
}

  
}
Disconnect(slide:IonSlides, UpCar:Car)
{
  this.CarName='Car not Paired';
  this.checkedalready=false;
  this.live_data_fetched_already=false;
  this.BluetoothFlag=true;
  this.QueueIndex=0;
  this.ChangeSlideStatus(slide,false);
  this.UpdateCar(UpCar,'Dark');
  this.Firebase.removeCodes();
  this.Firebase.removeLiveData();
  for(let i=0;i<this.SupportedOBD.length;i++)
    this.SupportedOBD[i].Value='-';
  this.bluetooth.disconnect();
}
ChangeSlideStatus(slide:IonSlides,lock:boolean)
{
  slide.lockSwipes(lock);

}

dataReceived(data,mode,VIN)
{
  var cmd,totalcmds, SingleString;
  cmd=data.toString('utf8')
  totalcmds=cmd.split('>');
  for(let i=0;i<totalcmds.length;i++)
  {
    SingleString=totalcmds[i];
    if(SingleString=='')
      continue;
      //console.log("Code: "+multipleRes[0]+", Resp1: "+multipleRes[1]+", Resp2: "+multipleRes[2]+", Resp3: "+multipleRes[3]);
      let check=SingleString;
      check=check.substring(4);
      check=check.trim();
      console.log("C: "+check+"== SEARCHING...UNABLE TO CONNECT, "+check.length);
      if(check.length==30)
      {
        this.SetVariable('PairIssue',"This Car doesnt Support OBD-II");
        
       

      }else{
        var multipleRes=SingleString.split('\r');
        let resp=0;
        if(multipleRes[1]!='' && multipleRes[1]!='NO DATA' && multipleRes[1]!='SEARCHING...')
          resp=1;
        else if(multipleRes[2]!='' && multipleRes[2]!='NO DATA'&& multipleRes[2]!='SEARCHING...')
          resp=2;
        else
          resp=3;
         
        if(multipleRes[0]==='0902')
        {
          if(check==='NO DATA')
              this.VehicleIDError="No Data received from OBD-2.<br>No Data will be Saved to Firebase";
          else if(check!=='NO DATA'){
           if((VIN === undefined || VIN === null)){
              this.VehicleIDError="First Time Pairing. Linking VID with Car";
              this.SetVariable('VIN',check.substring(4));

           }else if(VIN===check.substring(4))
            {
              this.VehicleIDError="Linking Successfull";
            } 
            else  
            {
              this.VehicleIDError="Please Connect with the correct Car to Save your Data";
            }
          
          }else{
            this.VehicleIDError="Could Not Find VIN in Your Car";
          }
      
          this.SetVariable('VID',this.VehicleIDError);
        }
      
        if(multipleRes[0]==='03')
        {
          this.TroubleCodes=[];
          //this.Firebase.removeCodes();
          
          if(multipleRes[resp]!=='NO DATA')
          {
           SingleString=SingleString.substring(7);
           let z=0; let Jump=0;
           while(z<SingleString.length){
            if(Jump==3){
              Jump=0;
              z+=3;
              continue; 
            }else{
              Jump++;
              this.TroubleCodes.push(SingleString.substring(z, z + 4));
              z+=4;
            }
            }
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
                  if(this.TroubleCodes[this.TroubleCodes.length-1].length<4)
                  this.TroubleCodes.pop();
                  console.log("Trouble Codes: "+JSON.stringify(this.Codes.codes));
                  if(this.TroubleCodes.length!=0)
                  {
                    for(let i=0;i<this.TroubleCodes.length;i++)
                    Codes.AllCodes.forEach(element => {
                      if(element.code==this.TroubleCodes[i])
                      this.Codes.codes.push({code:this.TroubleCodes[i],desc:element.description});});
                      this.Firebase.updateCode(this.Codes).then(res=>{this.presentToast("Engine Code Found");
                    this.Codes.codes=[]})
      
                  }else{this.presentToast("No Engine Code Found");}
                  this.TroubleCodes=[];
                }
            }else if(multipleRes[0].substring(0,2)==='01')
            {
              console.log("Code In 01: "+multipleRes[0]+", Response: "+multipleRes[resp]); 
              if(multipleRes[resp]!='NO DATA')
              {
                
              if(multipleRes[0]=='0103')
                this.FuelStatus(multipleRes[0],multipleRes[resp].substring(4,));
              else if(multipleRes[0]=='0104')
               this.convertLoad(multipleRes[0],multipleRes[resp].substring(4,));
             else if(multipleRes[0]=='0105')
               this.convertTemp(multipleRes[0],multipleRes[resp].substring(4,));
             else if(multipleRes[0]=='010A')
             {
             this.convertFuelRailPressure(multipleRes[0],multipleRes[resp].substring(4,));
             }
               
             else if(multipleRes[0]=='010B')
             {
               this.convertIntakePressure(multipleRes[0],multipleRes[resp].substring(4,));

             }
             else if(multipleRes[0]=='010C')
               this.convertRPM(multipleRes[0],multipleRes[resp].substring(4,));
             else if(multipleRes[0]=='010D')
               this.convertSpeed(multipleRes[0],multipleRes[resp].substring(4,));
             else if(multipleRes[0]=='010F' )
               this.convertTemp(multipleRes[0],multipleRes[resp].substring(4,));
             else if(multipleRes[0]=='0111')
               this.convertThrottlePos(multipleRes[0],multipleRes[resp].substring(4,));
             else if(multipleRes[0]=='012E')
               this.convertThrottlePos(multipleRes[0],multipleRes[resp].substring(4,));
             else if(multipleRes[0]==='0100')
             {
              //this.showError("Code 0100 Response: ","Resp 1: "+multipleRes[1]+"Resp 2: "+multipleRes[2]+"Resp 3: "+multipleRes[3]);
              let reply=(parseInt(multipleRes[resp].substring(4,), 16)).toString(2);
              for(let k=0;k<reply.length;k++)
                if(reply.charAt(k)=='1')
                  this.SupportedOBD[k].Value='Yes';
                else
                this.SupportedOBD[k].Value='No';
             }}  
            }
          
          if(mode=='00')
          {
            if(this.QueueIndex<this.queue.length)
              this.InitiateOBD(this.queue[this.QueueIndex++]);
            else
              this.presentToast("OBD-II Setup Completed"); 
          }else if(mode=='01')
          {
            if(this.LiveDataIndex<this.LiveDataCmds.length)
              this.InitiateOBD(this.LiveDataCmds[this.LiveDataIndex++]);
            else
              this.LiveDataIndex=0;
          }
      }

       
      
 }   
}


FuelStatus(code, resp)
{  var reply = ['Open Loop 0',//, Insufficient engine temp
               'Closed Loop 0',//, Using Oxygen Sensor
               'Open Loop 1',//, Engine Load
               'Open Loop 2',//, System Failure
               'Closed Loop 1',//, Using Oxygen Sensor (Faulty Feedback)
               'Null',
               'Null',
               'Null'];
   let  respose='Null';
   respose = (parseInt(resp, 16)).toString(2);
   for(let k=0;k<respose.length;k++)
    if(respose.charAt(k)=='1')
      respose=reply[k];
    
  
  this.Firebase.updateLiveDataValues(code,respose); 
}
convertThrottlePos(code,byte) 
{
  console.log("code: "+code+", re: "+byte);
  var reply=(parseInt(byte, 16) * 100) / 255;
  reply=Math.round((reply + Number.EPSILON) * 100) / 100
  this.Firebase.updateLiveDataValues(code,reply);

}
convertLoad(code,byte) {
  console.log("code: "+code+", re: "+byte);
  var reply=parseInt(byte, 16) * (100 / 256);
  reply=Math.round((reply + Number.EPSILON) * 100) / 100
  this.Firebase.updateLiveDataValues(code,reply);
 
}
convertTemp(code,byte) 
{console.log("code: "+code+", re: "+byte);
  var reply=parseInt(byte, 16) - 40;
  this.Firebase.updateLiveDataValues(code,reply);
}
convertPercentA(code, byte){
  console.log("code: "+code+", re: "+byte);
  var reply=parseInt(byte, 16) * 100 / 255;
  this.Firebase.updateLiveDataValues(code,reply);
 
}
convertFuelRailPressure(code,byte) 
{  console.log("code: "+code+", re: "+byte);

  var reply=parseInt(byte, 16) * 3;
  reply=Math.round((reply + Number.EPSILON) * 100) / 100
  let ans=reply+" kPa";
   this.Firebase.updateLiveDataValues(code,reply);
  
}
convertIntakePressure(code,byte) {
  console.log("code: "+code+", re: "+byte);

  var reply=parseInt(byte, 16);
  reply=Math.round((reply + Number.EPSILON) * 100) / 100

  this.Firebase.updateLiveDataValues(code,reply);
  
}
convertRPM(code,byteA) 
{  console.log("code: "+code+", re: "+byteA);

  var A=byteA.substring(0,2);
  var B=byteA.substring(2,);
  console.log("Byte A:"+byteA+", Byte B:");
  var reply=((parseInt(A, 16) * 256)+ (parseInt(B, 16)) ) / 4;
  reply=Math.round((reply + Number.EPSILON) * 100) / 100
  this.Firebase.updateLiveDataValues(code,reply);
}
convertSpeed(code,byte) 
{
  console.log("code: "+code+", re: "+byte);

  var reply= parseInt(byte, 16);
  reply=Math.round((reply + Number.EPSILON) * 100) / 100

  this.Firebase.updateLiveDataValues(code,reply);
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
  duration: 1500,
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
export interface cide{
  code:string;
  desc:string;
}


export interface paired {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  
}



