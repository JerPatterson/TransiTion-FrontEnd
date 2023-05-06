import { TestBed } from '@angular/core/testing';
import { RouteListComponent } from './route-list.component';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                RouteListComponent
            ],
        }).compileComponents();
    });
    
    it('should create the app', () => {
        const fixture = TestBed.createComponent(RouteListComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
