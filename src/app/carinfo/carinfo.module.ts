import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarinfoPageRoutingModule } from './carinfo-routing.module';

import { CarinfoPage } from './carinfo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarinfoPageRoutingModule
  ],
  declarations: [CarinfoPage]
})
export class CarinfoPageModule {}
