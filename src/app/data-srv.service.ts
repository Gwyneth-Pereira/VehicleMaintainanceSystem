import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { code, FirebaseService } from './firebase.service';
import { codesdesc } from './codedesc';

@Injectable({
  providedIn: 'root'
})

export class DataSrvService {
  public car_name_as_on_slide:string="Car not paired.";
  queue=['ATZ\r','ATS0\r','ATL0\r','ATSP0\r','0100\r','0902\r'];//Setting Up OBD-II Commands;
  LiveDataCmds=[];
  QueueIndex=0;//Index to guide the obd command array to the next point
  LiveDataIndex=0;
  public VehicleIDError='';
  
  public Codes:code={id:'codes',codes:{}as cide[]}as code;
  TroubleCodes:string[];
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
  this.InitiateOBD(this.LiveDataCmds.splice(0,1));

  
}
Disconnect()
{
 
  this.QueueIndex=0;
  this.bluetooth.disconnect();
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
      var multipleRes=SingleString.split('\r');
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
            // this.TroubleCodes.forEach(element => {
            //   this.Codes.codes.push( element, "")
              
            // });

            for(let k=0;k<this.TroubleCodes.length;k++)
            {
              for(let j=0;j<codesdesc.length;j++)
              {
                if(this.TroubleCodes[k]==codesdesc[j].code)
                {let val={code:this.TroubleCodes[k],desc:codesdesc[j].description};
                  this.Codes.codes.push(val);
                }
              }
            
            }

           // this.Codes.codes=this.TroubleCodes;  
            console.log("Code: "+this.Codes);
            this.Firebase.updateCode(this.Codes).then(res=>{
              this.showError("Alert","Code Found");
            })
            //for(let q=0;q<this.TroubleCodes.length;q++)
            //this.TroubleCodes=this.TroubleCodes[q]        
           // this.TCode=this.fetchModel(this.TroubleCodes);
    
            }else{
              //console.log("no codes found");
            }
          
        
      }
      else if(multipleRes[0].substring(0,2)==='01')
      {
        console.log("Code: "+multipleRes[0]+", Resp: "+multipleRes[2]+", Resp: "+multipleRes[3])
        if(multipleRes[0]=='0103' &&multipleRes[2]!='NO DATA')
          this.FuelStatus(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='0104' &&multipleRes[2]!='NO DATA')
          this.convertLoad(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='0105' &&multipleRes[2]!='NO DATA')
          this.convertTemp(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='010A' &&multipleRes[2]!='NO DATA')
          this.convertFuelRailPressure(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='010B' &&multipleRes[2]!='NO DATA')
          this.convertIntakePressure(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='010C' &&multipleRes[2]!='NO DATA')
          this.convertRPM(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='010D' &&multipleRes[2]!='NO DATA')
          this.convertSpeed(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='010F' &&multipleRes[2]!='NO DATA')
          this.convertTemp(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='0111' &&multipleRes[2]!='NO DATA')
          this.convertThrottlePos(multipleRes[0],multipleRes[2].substring(4,));
        else if(multipleRes[0]=='012E' &&multipleRes[2]!='NO DATA')
          this.convertThrottlePos(multipleRes[0],multipleRes[2].substring(4,));
        else{
          let reply="Value Not Found";
          //if(multipleRes[0]!='0100')
            //this.Firebase.updateLiveDataValues(multipleRes[0],reply);
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
 
    
}


FuelStatus(code, resp)
{
  var reply = {byteA:0,byteB:0};
            var byteA=resp.substring(0,2);
            var byteB=resp.substring(2,);
            reply.byteA = parseInt(byteA, 2);
            if(byteB)
            reply.byteB = parseInt(byteB, 2);
            this.Firebase.updateLiveDataValues(code,reply.byteA); 
}
convertThrottlePos(code,byte) 
{
  var reply=(parseInt(byte, 16) * 100) / 255;
  this.Firebase.updateLiveDataValues(code,reply);

}
convertLoad(code,byte) {
  var reply=parseInt(byte, 16) * (100 / 256);
  this.Firebase.updateLiveDataValues(code,reply);
 
}
convertTemp(code,byte) 
{
  var reply=parseInt(byte, 16) - 40;
  this.Firebase.updateLiveDataValues(code,reply);
}
convertPercentA(code, byte){
  var reply=parseInt(byte, 16) * 100 / 255;
  this.Firebase.updateLiveDataValues(code,reply);
 
}
convertFuelRailPressure(code,byte) 
{
  var reply=parseInt(byte, 16) * 3;
  this.Firebase.updateLiveDataValues(code,reply);
  
}
convertIntakePressure(code,byte) {
  var reply=parseInt(byte, 16);
  this.Firebase.updateLiveDataValues(code,reply);
  
}
convertRPM(code,byteA) 
{
  var A=byteA.substring(0,2);
  var B=byteA.substring(2,);
  console.log("Byte A:"+byteA+", Byte B:");
  var reply=((parseInt(A, 16) * 256)+ (parseInt(B, 16)) ) / 4;
  this.Firebase.updateLiveDataValues(code,reply);
}
convertSpeed(code,byte) 
{
  var reply= parseInt(byte, 16);
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



