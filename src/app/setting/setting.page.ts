import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataSrvService} from '../data-srv.service';
import { Setting } from '../firebase.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  private currentSetting:Observable<Setting[]>;
  constructor(public DataSrv:DataSrvService) { }

  ngOnInit() {
   
  }
  SaveSetting()
  {

  }

  onDelete()
  {

    this.DataSrv.showChoice("Alert","Sure you want to delete your account??").then( sucess=>
    { 
    if (this.DataSrv.handlerMessage=="confirmed")
    {
      console.log(this.DataSrv.handlerMessage);
      console.log(this.DataSrv.roleMessage);
      // add the code to delete record from firebase and auth . 

    }
    else{
      this.DataSrv.presentToast("Account is not deleted.")

      console.log(this.DataSrv.handlerMessage);
      console.log(this.DataSrv.roleMessage);
    }
  });
}

}
