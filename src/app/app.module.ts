import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouteListComponent } from './components/route-list/route-list.component';
import { StopListComponent } from './components/stop-list/stop-list.component';

@NgModule({
    declarations: [
        RouteListComponent,
        StopListComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [RouteListComponent]
})
export class AppModule {}
