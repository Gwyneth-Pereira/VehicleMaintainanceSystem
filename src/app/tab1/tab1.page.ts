import { Component } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { obdinfo } from '../obdinfo';
import * as _ from 'underscore';
import * as moment from 'moment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  private selectedSegment: string ='Sensor';
  lastConnectedToOBD;
  receivedData;
  constructor(private bluetooth:BluetoothSerial) {
    this.lastConnectedToOBD = Date.now();
  }

  segmentChanged(event : any){
  console.log(event.target.value);
  this.selectedSegment=event.target.value;
  }

  searchOBD()
  {
    console.log('[INFO] Device Connec ted: '+JSON.stringify(this.bluetooth.isConnected()));


    this.bluetooth.isConnected().then((success)=>{
      this.bluetooth.write('P0103\r').then((tru)=>{
        console.log('Hello:  ' + JSON.stringify(tru));

      }).catch(er=>{console.log(er)})

  
    }

    ).catch(err=>{      console.log('[INFO] Device Not Connected ');
  })
  }

  DataReceived(data)
  {
    this.lastConnectedToOBD = Date.now();
    var currentString, arrayOfCommands;
    currentString = this.receivedData + data.toString('utf8'); // making sure it's a utf8 string
    arrayOfCommands = currentString.split('>');
    var forString;
    if (arrayOfCommands.length < 2)
     {
      this.receivedData = arrayOfCommands[0];
     } 
    else {
      for (var i = 0; i < arrayOfCommands.length; i++) {
          forString = arrayOfCommands[i];
          if (forString === '')
             continue;
          var multipleMessages = forString.split('\r');
          for (var k = 0; k < multipleMessages.length; k++) {
              var messageString = multipleMessages[k];
              if (messageString === '') 
                  continue;
              var reply;
              reply = this.parseOBDCommand(messageString);
                this.btEventEmit('dataReceived', reply);
                this.receivedData = '';
            }
        }
    }
  }
  parseOBDCommand = function (hexString) {
    var reply,
        byteNumber,
        valueArray; //New object
  
    reply = {};
    if (hexString === "NO DATA" || hexString === "OK" || hexString === "?" || hexString === "UNABLE TO CONNECT" || hexString === "SEARCHING...") {
        //No data or OK is the response, return directly.
        reply.value = hexString;
        return reply;
    }
  
    hexString = hexString.replace(/ /g, ''); //Whitespace trimming //Probably not needed anymore?
    valueArray = [];
  
    for (byteNumber = 0; byteNumber < hexString.length; byteNumber += 2) {
        valueArray.push(hexString.substr(byteNumber, 2));
    }
  
    if (valueArray[0] === "41") {
        reply.mode = valueArray[0];
        reply.pid = valueArray[1];
        for (var i = 0; i < obdinfo.PIDS.length; i++) {
            if (obdinfo.PIDS[i].pid == reply.pid) {
                var numberOfBytes = obdinfo.PIDS[i].bytes;
                reply.name = obdinfo.PIDS[i].name;
                switch (numberOfBytes) {
                    case 1:
                        reply.value = obdinfo.PIDS[i].convertToUseful(valueArray[2]);
                        break;
                    case 2:
                        reply.value = obdinfo.PIDS[i].convertToUseful2(valueArray[2], valueArray[3]);
                        break;
                    case 4:
                        reply.value = obdinfo.PIDS[i].convertToUseful4(valueArray[2], valueArray[3], valueArray[4], valueArray[5]);
                        break;
                    case 6:
                        reply.value = obdinfo.PIDS[i].convertToUseful6(valueArray[2], valueArray[3], valueArray[4], valueArray[5], valueArray[6], valueArray[7] );
                        break;
                }
                break; //Value is converted, break out the for loop.
            } 
        }
    } else if (valueArray[0] === "43") {
        reply.mode = valueArray[0];
        for (var ij = 0; ij < obdinfo.PIDS.length; ij++) {
            if (obdinfo.PIDS[ij].mode == "03") {
                reply.name = obdinfo.PIDS[ij].name;
                reply.value = obdinfo.PIDS[ij].convertToUseful6(valueArray[1], valueArray[2], valueArray[3], valueArray[4], valueArray[5], valueArray[6]);
            }
        }
    }
    return reply;
  };
  
  btEventEmit = function (event,text) {
    var pdata={ts:0,name:"",value:"",};

    if ( event!=='dataReceived' || text.value === 'NO DATA' || text.name === undefined || text.value === undefined) {
        return;
    }
    console.log('[INFO] Metric for ' + text.name);
    pdata = {ts:Date.now(),name:text.name,value:text.value};
    this.liveStatsNumRecordsSinceConnected++;
    this.execSql('INSERT INTO livemetricstable VALUES (?,?,?,?,?)', [null,pdata.ts, pdata.name, pdata.value, 0],'');
    if (pdata.name=='rpm') { 
      this.lastRPMmetricTimestamp = pdata.ts;
      this.lastRPMmetricvalue = pdata.value;
    }
    if (pdata.name!=='location'){ 
        if (this.liveMetrics[pdata.name]==undefined) {
          var mt =_.findWhere(this.obdmetrics, { name: pdata.name }); 
          this.liveMetrics[pdata.name]={};
          this.liveMetrics[pdata.name].description = mt.description;
          this.liveMetrics[pdata.name].name=mt.name;
          this.liveMetrics[pdata.name].unit=mt.unit;
          this.liveMetrics[pdata.name].type='';  
        }
        this.liveMetrics[pdata.name].value=pdata.value;
        if (this.liveMetrics[pdata.name].unit=='sec.' || this.liveMetrics[pdata.name].type=='s' ) {
          this.liveMetrics[pdata.name].value=moment.utc(parseInt(pdata.value)).format('HH:mm:ss'); 
          this.liveMetrics[pdata.name].unit='';  
          this.liveMetrics[pdata.name].type='s';  
        }
  } else {  // location data
    if (this.liveMetrics['latitude']==undefined) {
       this.liveMetrics['latitude']={};
      this.liveMetrics['latitude'].description = 'Location: latitude';
      this.liveMetrics['latitude'].name='';
      this.liveMetrics['latitude'].unit='°'
      this.liveMetrics['latitude'].type='';          
    }
    this.liveMetrics['latitude'].value=  JSON.parse(pdata.value).latitude;
    if (this.liveMetrics['longitude']==undefined) {
      this.liveMetrics['longitude']={};
     this.liveMetrics['longitude'].description = 'Location: longitude';
     this.liveMetrics['longitude'].name='';
     this.liveMetrics['longitude'].unit='°'
     this.liveMetrics['longitude'].type='';          
    }
    this.liveMetrics['longitude'].value=  JSON.parse(pdata.value).longitude;
  }
  }

}
