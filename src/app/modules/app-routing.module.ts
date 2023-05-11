import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulePageComponent } from '../pages/schedule-page/schedule-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/schedule', pathMatch: 'full' },
    { path: 'schedule', component: SchedulePageComponent },
    { path: '**', redirectTo: '/schedule' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
