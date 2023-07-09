import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page.component';
import { VehicleInfoComponent } from './components/vehicle-info/vehicle-info.component';

const routes: Routes = [
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    { path: 'main', component: MainPageComponent },
    { path: 'vehicle', component: VehicleInfoComponent },
    { path: '**', redirectTo: '/main' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
