import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DraggableModule } from './draggable/draggable-module';
import { NgDialogComponent } from './ng-dialog.component';
import { ResizableModule } from './resizable/resizable-module';



@NgModule({
  declarations: [
    NgDialogComponent
  ],
  imports: [
    CommonModule,
    ResizableModule,
    DraggableModule,
  ],
  exports: [
    NgDialogComponent
  ]
})
export class NgDialogModule { }
