import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddDocPage } from './add-doc.page';

const routes: Routes = [
  {
    path: '',
    component: AddDocPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddDocPageRoutingModule {}
