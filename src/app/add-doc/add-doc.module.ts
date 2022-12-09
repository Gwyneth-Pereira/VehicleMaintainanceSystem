import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDocPageRoutingModule } from './add-doc-routing.module';

import { AddDocPage } from './add-doc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddDocPageRoutingModule
  ],
  declarations: [AddDocPage]
})
export class AddDocPageModule {}
