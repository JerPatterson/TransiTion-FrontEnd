import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page.component';
import { ToolbarComponent } from './components/lists/toolbar/toolbar.component';

const routes: Routes = [
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    { path: 'main', component: MainPageComponent },
    { path: 'tools', component: ToolbarComponent },
    { path: '**', redirectTo: '/main' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
