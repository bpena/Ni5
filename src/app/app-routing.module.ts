import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {LoginModule} from "./modules/login/login.module";
import {SimpleSearchModule} from "./modules/simple-search/simple-search.module";

const routes: Routes = [
  {path: '', redirectTo: 'search', pathMatch: 'full'},
  {path: 'login', component: LoginModule}
];

@NgModule({
  imports: [
    LoginModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {

}
