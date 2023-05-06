import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouteListComponent } from './components/route-list/route-list.component';

@NgModule({
    declarations: [
        RouteListComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [RouteListComponent]
})
export class AppModule {}
