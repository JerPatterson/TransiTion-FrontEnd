import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopSelectToolsComponent } from './select-tools.component';

describe('StopSelectToolsComponent', () => {
    let component: StopSelectToolsComponent;
    let fixture: ComponentFixture<StopSelectToolsComponent>;
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ StopSelectToolsComponent ]
        })
        .compileComponents();
        
        fixture = TestBed.createComponent(StopSelectToolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
