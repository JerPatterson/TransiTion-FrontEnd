import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AgencyPageComponent } from '@app/pages/agency-page/agency-page.component';
import { RoutesPageComponent } from '@app/pages/routes-page/routes-page.component';
import { StopsPageComponent } from '@app/pages/stops-page/stops-page.component';
import { SchedulePageComponent } from '@app/pages/schedule-page/schedule-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/agency-list', pathMatch: 'full' },
    { path: 'agency-list', component: MainPageComponent },
    { path: 'agency/:agency-name', component: AgencyPageComponent },
    { path: 'routes/:agency-name', component: RoutesPageComponent },
    { path: 'stops/:agency-name', component: StopsPageComponent },
    { path: 'stops/:agency-name/:route-id', component: StopsPageComponent },
    { path: 'schedule/:agency-name/:route-id/:stop-id', component: SchedulePageComponent },
    { path: '**', redirectTo: '/agency-list' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
