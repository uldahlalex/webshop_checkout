import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Route, RouteReuseStrategy, RouterModule} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Week43Day2Component} from "./week43day2/week43day2";
import {Week43Day1Component} from "./week43day1/week43day1";

@NgModule({
  declarations: [AppComponent, Week43Day2Component, Week43Day1Component],
  imports: [BrowserModule,
    IonicModule.forRoot({mode: "ios"}),
    HttpClientModule, ReactiveFormsModule, FormsModule
  ],
  providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy}],
  bootstrap: [AppComponent],
})
export class AppModule {
}
