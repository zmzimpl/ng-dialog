import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDialogComponent } from './ng-dialog.component';

describe('NgDialogComponent', () => {
  let component: NgDialogComponent;
  let fixture: ComponentFixture<NgDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
