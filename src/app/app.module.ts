import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from '@app/components/app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { AgencyPageComponent } from '@app/pages/agency-page/agency-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { RoutesPageComponent } from '@app/pages/routes-page/routes-page.component';
import { StopsPageComponent } from '@app/pages/stops-page/stops-page.component';
import { SchedulePageComponent } from '@app/pages/schedule-page/schedule-page.component';
import { MapComponent } from '@app/components/map/map.component';
import { MapPageComponent } from './pages/map-page/map-page.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    AgencyPageComponent,
    RoutesPageComponent,
    StopsPageComponent,
    SchedulePageComponent,
    MapComponent,
    MapPageComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
