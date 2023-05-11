import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouteListComponent } from './components/route-list/route-list.component';
import { StopListComponent } from './components/stop-list/stop-list.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { RouteInfographyComponent } from './components/route-infography/route-infography.component';
import { AppRoutingModule } from './modules/app-routing.module';
import { SchedulePageComponent } from './pages/schedule-page/schedule-page.component';

@NgModule({
    declarations: [
        RouteListComponent,
        StopListComponent,
        ScheduleComponent,
        RouteInfographyComponent,
        SchedulePageComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [SchedulePageComponent]
})
export class AppModule {}
