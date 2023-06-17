import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from '@app/components/app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { AgencyListComponent } from '@app/components/agency-list/agency-list.component';
import { RouteListComponent } from '@app/components/route-list/route-list.component';
import { StopListComponent } from '@app/components/stop-list/stop-list.component';
import { SchedulePageComponent } from '@app/pages/schedule-page/schedule-page.component';
import { MapComponent } from '@app/components/map/map.component';
import { TimeComparisonComponent } from './components/time-comparison/time-comparison.component';

@NgModule({
  declarations: [
    AppComponent,
    AgencyListComponent,
    RouteListComponent,
    StopListComponent,
    SchedulePageComponent,
    MapComponent,
    TimeComparisonComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
