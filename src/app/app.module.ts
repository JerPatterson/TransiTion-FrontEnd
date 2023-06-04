import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from '@app/app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { AgencyPageComponent } from './pages/agency-page/agency-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { RoutesPageComponent } from './pages/routes-page/routes-page.component';
import { StopsPageComponent } from './pages/stops-page/stops-page.component';
import { SchedulePageComponent } from './pages/schedule-page/schedule-page.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    AgencyPageComponent,
    RoutesPageComponent,
    StopsPageComponent,
    SchedulePageComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
