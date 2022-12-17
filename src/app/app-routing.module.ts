import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
import { AuthGuard as a2 } from './guard2/auth.guard';
const routes: Routes = [
   {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate:[AuthGuard]
  },
  {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then( m => m.SettingPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'profile/:uid',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'carinfo',
    loadChildren: () => import('./carinfo/carinfo.module').then( m => m.CarinfoPageModule)
  },
  {
    path: 'carinfo/:uid',
    loadChildren: () => import('./carinfo/carinfo.module').then( m => m.CarinfoPageModule)
  },
  {
    path: 'addnewcar',
    loadChildren: () => import('./addnewcar/addnewcar.module').then( m => m.AddnewcarPageModule)
  },
  
  {
    path: 'getstarted',
    loadChildren: () => import('./getstarted/getstarted.module').then( m => m.GetstartedPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    canActivate:[a2]
  },
  {
    path: 'create-account',
    loadChildren: () => import('./create-account/create-account.module').then( m => m.CreateAccountPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  }




];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
