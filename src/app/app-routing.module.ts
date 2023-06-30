import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulePageComponent } from '@app/pages/schedule-page.component';
import { RouteComponent } from './components/elements/route/route.component';

const routes: Routes = [
    { path: '', redirectTo: '/schedule', pathMatch: 'full' },
    { path: 'schedule', component: SchedulePageComponent },
    { path: 'route', component: RouteComponent },
    { path: '**', redirectTo: '/schedule' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
