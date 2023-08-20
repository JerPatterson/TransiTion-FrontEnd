import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AppComponent } from '@app/components/app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { AgencyListComponent } from '@app/components/lists/agency-list/agency-list.component';
import { RouteListComponent } from '@app/components/lists/route-list/route-list.component';
import { StopListComponent } from '@app/components/lists/stop-list/stop-list.component';
import { MainPageComponent } from '@app/pages/main-page.component';
import { MapComponent } from '@app/components/map/map.component';
import { RouteComponent } from './components/list-elements/route/route.component';
import { StopComponent } from './components/list-elements/stop/stop.component';
import { AgencyComponent } from './components/list-elements/agency/agency.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { VehicleInfoComponent } from './components/info-elements/vehicle-info/vehicle-info.component';
import { RouteIdentifierComponent } from './components/elements/route-identifier/route-identifier.component';
import { RouteTypeComponent } from './components/elements/route-type/route-type.component';
import { TripDirectionComponent } from './components/elements/trip-direction/trip-direction.component';
import { StopInfoComponent } from './components/info-elements/stop-info/stop-info.component';
import { TimeComponent } from './components/list-elements/time/time.component';
import { SettingsComponent } from './components/settings/settings.component';

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
    VehicleInfoComponent,
    RouteIdentifierComponent,
    RouteTypeComponent,
    TripDirectionComponent,
    StopInfoComponent,
    TimeComponent,
    SettingsComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    ScrollingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
