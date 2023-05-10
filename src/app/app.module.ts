import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouteListComponent } from './components/route-list/route-list.component';
import { StopListComponent } from './components/stop-list/stop-list.component';
import { SelectToolsComponent } from './components/select-tools/select-tools.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { RouteInfographyComponent } from './components/route-infography/route-infography.component';
import { AppRoutingModule } from './modules/app-routing.module';

@NgModule({
    declarations: [
        RouteListComponent,
        StopListComponent,
        SelectToolsComponent,
        ScheduleComponent,
        RouteInfographyComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [SelectToolsComponent]
})
export class AppModule {}
