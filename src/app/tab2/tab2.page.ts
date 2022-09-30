import { Component } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  pairedDevices: [paired];
  constructor(private bluetooth:BluetoothSerial, private permission:AndroidPermissions, private alert: AlertController) {}

  Pair()
  {
   this.permission.checkPermission(this.permission.PERMISSION.BLUETOOTH_SCAN).then(
      result => {this.permission.requestPermissions([this.permission.PERMISSION.BLUETOOTH_SCAN,this.permission.PERMISSION.BLUETOOTH_CONNECT]);
                 console.log('Has Scan permission?',result.hasPermission)},
      err => {this.permission.requestPermissions([this.permission.PERMISSION.BLUETOOTH_SCAN,this.permission.PERMISSION.BLUETOOTH_CONNECT]);
              console.log('requestPermsson Scan :',err.hasPermission)});
/*

  this.permission.checkPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT).then(
      result => {this.permission.requestPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT)
                console.log('Has Connect permission?',result.hasPermission)},
      err => {this.permission.requestPermission(this.permission.PERMISSION.BLUETOOTH_CONNECT)
              console.log('requestPermsson Connect:',err.hasPermission)});
*/
    

  }

}
interface paired {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  "isSelected":boolean
}