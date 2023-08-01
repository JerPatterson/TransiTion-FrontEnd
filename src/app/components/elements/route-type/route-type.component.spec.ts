import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteTypeIconComponent } from './route-type.component';

describe('RouteTypeIconComponent', () => {
    let component: RouteTypeIconComponent;
    let fixture: ComponentFixture<RouteTypeIconComponent>;
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ RouteTypeIconComponent ]
        })
        .compileComponents();
        
        fixture = TestBed.createComponent(RouteTypeIconComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
