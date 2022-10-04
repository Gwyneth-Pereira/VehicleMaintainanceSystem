import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddnewcarPageRoutingModule } from './addnewcar-routing.module';

import { AddnewcarPage } from './addnewcar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddnewcarPageRoutingModule
  ],
  declarations: [AddnewcarPage]
})
export class AddnewcarPageModule {}
