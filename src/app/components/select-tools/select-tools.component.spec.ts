import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectToolsComponent } from './select-tools.component';

describe('SelectToolsComponent', () => {
    let component: SelectToolsComponent;
    let fixture: ComponentFixture<SelectToolsComponent>;
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ SelectToolsComponent ]
        })
        .compileComponents();
        
        fixture = TestBed.createComponent(SelectToolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
