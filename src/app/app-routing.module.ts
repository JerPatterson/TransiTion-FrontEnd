import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulePageComponent } from '@app/pages/schedule-page.component';
import { StopComponent } from './components/elements/stop/stop.component';

const routes: Routes = [
    { path: '', redirectTo: '/schedule', pathMatch: 'full' },
    { path: 'schedule', component: SchedulePageComponent },
    { path: 'stop', component: StopComponent },
    { path: '**', redirectTo: '/schedule' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
