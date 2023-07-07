import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulePageComponent } from '@app/pages/schedule-page.component';
import { ToolbarComponent } from './components/lists/toolbar/toolbar.component';

const routes: Routes = [
    { path: '', redirectTo: '/schedule', pathMatch: 'full' },
    { path: 'schedule', component: SchedulePageComponent },
    { path: 'tools', component: ToolbarComponent },
    { path: '**', redirectTo: '/schedule' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
