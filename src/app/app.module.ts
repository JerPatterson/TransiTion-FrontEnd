import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouteListComponent } from './components/route-list/route-list.component';
import { StopListComponent } from './components/stop-list/stop-list.component';
import { StopSelectToolsComponent } from './components/stop-select-tools/stop-select-tools.component';

@NgModule({
    declarations: [
        RouteListComponent,
        StopListComponent,
        StopSelectToolsComponent,
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [StopSelectToolsComponent]
})
export class AppModule {}
