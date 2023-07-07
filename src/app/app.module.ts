import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppComponent } from '@app/components/app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { AgencyListComponent } from '@app/components/lists/agency-list/agency-list.component';
import { RouteListComponent } from '@app/components/lists/route-list/route-list.component';
import { StopListComponent } from '@app/components/lists/stop-list/stop-list.component';
import { MainPageComponent } from '@app/pages/main-page.component';
import { MapComponent } from '@app/components/map/map.component';
import { RouteComponent } from './components/elements/route/route.component';
import { StopComponent } from './components/elements/stop/stop.component';
import { AgencyComponent } from './components/elements/agency/agency.component';
import { ToolbarComponent } from './components/lists/toolbar/toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    AgencyListComponent,
    RouteListComponent,
    StopListComponent,
    MainPageComponent,
    MapComponent,
    RouteComponent,
    StopComponent,
    AgencyComponent,
    ToolbarComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
