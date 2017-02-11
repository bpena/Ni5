import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardModule} from "./dashboard.module";
import {DashboardComponent} from './dashboard.component';
import {SimpleSearchModule} from "../simple-search/simple-search.module";
import {SimpleSearchComponent} from "../simple-search/simple-search.component";
import {AuthGuardService} from "../../services/security/authGuard.service";
import {NavigatorModule} from "../navigator/navigator.module";
import {NavigatorComponent} from "../navigator/navigator.component";
const routes: Routes = [
  {
    path: '',
    // component: SimpleSearchComponent,
    component: DashboardComponent,
    children: [
      { path: 'search', component: SimpleSearchComponent, canActivate: [AuthGuardService]},
      { path: 'list', component: NavigatorComponent, canActivate: [AuthGuardService]},
      { path: 'list/:schema', component: NavigatorComponent, canActivate: [AuthGuardService]},
      { path: 'list/:schema/:criteria', component: NavigatorComponent, canActivate: [AuthGuardService]}
    ]
  }
];

@NgModule({
  imports: [
    DashboardModule,
    NavigatorModule,
    RouterModule.forChild(routes),
    SimpleSearchModule
  ],
  exports: [RouterModule],
  providers: [AuthGuardService]
})
export class DashboardRoutingModule { }
