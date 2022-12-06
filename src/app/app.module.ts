import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule}from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { initializeApp } from "firebase/app";
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { IonicStorageModule } from '@ionic/storage-angular';
import {Drivers}  from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrxyWa5AdMkb_NQ7ThTD-mKm_grKCRTG0",
  authDomain: "seniorproj-bbe21.firebaseapp.com",
  projectId: "seniorproj-bbe21",
  storageBucket: "seniorproj-bbe21.appspot.com",
  messagingSenderId: "599263899142",
  appId: "1:599263899142:web:8ce56b06711a751bafdd87"
};





@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,
     IonicModule.forRoot(),
     IonicStorageModule.forRoot(
      {
       name: 'Cogear DB',
       driverOrder:[CordovaSQLiteDriver._driver,Drivers.LocalStorage,Drivers.IndexedDB]
       ///
      }
     ),AngularFireModule.initializeApp(firebaseConfig),
     AngularFirestoreModule,  AngularFireAuthModule,   
     AppRoutingModule],
  providers: [AndroidPermissions,
              BluetoothSerial,
              LocalNotifications,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
