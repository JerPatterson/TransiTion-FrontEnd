import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectToolsComponent } from '../components/select-tools/select-tools.component';

const routes: Routes = [
    { path: '', redirectTo: '/schedule', pathMatch: 'full' },
    { path: 'schedule', component: SelectToolsComponent },
    { path: '**', redirectTo: '/schedule' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
