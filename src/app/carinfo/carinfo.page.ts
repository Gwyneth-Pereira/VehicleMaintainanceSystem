import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-carinfo',
  templateUrl: './carinfo.page.html',
  styleUrls: ['./carinfo.page.scss'],
})
export class CarinfoPage implements OnInit {
 public uid:string;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params['uid'] );
      this.uid=params['uid'];
 });
  
  }

}
