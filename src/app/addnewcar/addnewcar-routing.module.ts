import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddnewcarPage } from './addnewcar.page';

const routes: Routes = [
  {
    path: '',
    component: AddnewcarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddnewcarPageRoutingModule {}
