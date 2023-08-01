import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteIdentifierComponent } from './route-identifier.component';

describe('RouteIdentifierComponent', () => {
    let component: RouteIdentifierComponent;
    let fixture: ComponentFixture<RouteIdentifierComponent>;
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ RouteIdentifierComponent ]
        })
        .compileComponents();
        
        fixture = TestBed.createComponent(RouteIdentifierComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
