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

}
