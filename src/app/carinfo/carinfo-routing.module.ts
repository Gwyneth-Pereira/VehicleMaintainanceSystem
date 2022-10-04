import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarinfoPage } from './carinfo.page';

const routes: Routes = [
  {
    path: '',
    component: CarinfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarinfoPageRoutingModule {}
