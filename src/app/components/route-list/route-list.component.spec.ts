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
    
    it(`should have as title 'buses'`, () => {
        const fixture = TestBed.createComponent(RouteListComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('buses');
    });
    
    it('should render title', () => {
        const fixture = TestBed.createComponent(RouteListComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.content span')?.textContent).toContain('buses app is running!');
    });
});
