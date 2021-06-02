import {
  Component, ElementRef, ViewChild, Input, Output, AfterViewChecked, HostListener, EventEmitter, ViewEncapsulation, Renderer2, ChangeDetectorRef
} from '@angular/core';
import { ResizableEvent } from './resizable/types';
import { maxZIndex, findAncestor } from './utils';

@Component({
  selector: 'ng-dialog',
  templateUrl: './ng-dialog.component.html',
  styleUrls: [
    './ng-dialog.component.less',
  ]
})
export class NgDialogComponent implements AfterViewChecked {

  @Input() isResizable = true;
  @Input() isDraggle = true;
  @Input() scrollTopEnable = true;
  @Input() maximizable: boolean = true;
  @Input() hideFooter: boolean = false;
  @Input() backdrop = true;
  _preMaximizeRootWidth: number | string;
  @Input()
  set preMaximizeRootWidth(width: number | string) {
    this._preMaximizeRootWidth = width;
    if (this.dialogRoot) {
      if (typeof width === 'string' && isNaN(+width)) {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'width', width);
      } else {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'width', width + 'px');
      }
    }
  };
  get preMaximizeRootWidth(): number | string {
    return this._preMaximizeRootWidth;
  }
  _preMaximizeRootHeight: number | string;
  @Input()
  set preMaximizeRootHeight(height: number | string) {
    this._preMaximizeRootHeight = height;
    if (this.dialogRoot) {
      if (typeof height === 'string' && isNaN(+height)) {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'height', height);
      } else {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'height', height + 'px');
      }
    }
  };
  get preMaximizeRootHeight(): number | string {
    return this._preMaximizeRootHeight;
  }
  @Input() position: { left: number, top: number } = null;

  @Output() closeDialog: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('dialogRoot', { static: false }) dialogRoot: ElementRef;
  @ViewChild('dialogBody', { static: false }) dialogBody: ElementRef;
  @ViewChild('dialogHeader', { static: false }) dialogHeader: ElementRef;
  @ViewChild('dialogFooter', { static: false }) dialogFooter: ElementRef;
  @ViewChild('closeIcon', { static: false }) closeIcon: ElementRef;

  visible: boolean;
  executePostDisplayActions: boolean;
  maximized: boolean;
  preMaximizeBodyHeight: number;
  preMaximizePageX: number;
  preMaximizePageY: number;
  dragEventTarget: MouseEvent | TouchEvent;

  constructor(private element: ElementRef, private renderer: Renderer2, private cdr: ChangeDetectorRef) { }

  ngAfterViewChecked() {
    if (this.executePostDisplayActions) {
      this.center();
      this.executePostDisplayActions = false;
    }
  }

  @HostListener('keydown.esc', ['$event'])
  onKeyDown(event): void {
    event.preventDefault();
    event.stopPropagation();
    this.hide();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.executePostDisplayActions = true;
    this.calcBodyHeight();
    // this.center();
  }

  show(): void {
    this.executePostDisplayActions = true;
    if (this.preMaximizeRootHeight) {
      if (typeof this.preMaximizeRootHeight === 'string' && isNaN(+this.preMaximizeRootHeight)) {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'height', this.preMaximizeRootHeight);
      } else {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'height', this.preMaximizeRootHeight + 'px');
      }
    }
    if (this.preMaximizeRootWidth) {
      if (typeof this.preMaximizeRootWidth === 'string' && isNaN(+this.preMaximizeRootWidth)) {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'width', this.preMaximizeRootWidth);
      } else {
        this.renderer.setStyle(this.dialogRoot.nativeElement, 'width', this.preMaximizeRootWidth + 'px');
      }
    }
    this.visible = true;
    setTimeout(() => {
      this.dialogRoot.nativeElement.focus();
      this.calcBodyHeight();
      if (this.scrollTopEnable) {
        this.dialogBody.nativeElement.scrollTop = 0;
      }
    }, 1);
  }

  finish() {
    this.visible = false;
    this.focusLastDialog();
  }

  hide(): void {
    this.visible = false;
    this.maximized = false;
    this.closeDialog.emit(true);
    this.focusLastDialog();
  }

  center() {
    let elementWidth = this.dialogRoot.nativeElement.offsetWidth;
    let elementHeight = this.dialogRoot.nativeElement.offsetHeight;

    if (elementWidth === 0 && elementHeight === 0) {
      this.dialogRoot.nativeElement.style.visibility = 'hidden';
      this.dialogRoot.nativeElement.style.display = 'block';
      elementWidth = this.dialogRoot.nativeElement.offsetWidth;
      elementHeight = this.dialogRoot.nativeElement.offsetHeight;
      this.dialogRoot.nativeElement.style.display = 'none';
      this.dialogRoot.nativeElement.style.visibility = 'visible';
    }

    if (!this.position) {
      const x = Math.max((window.innerWidth - elementWidth) / 2, 0);
      const y = Math.max((window.innerHeight - elementHeight) / 2, 0);

      this.dialogRoot.nativeElement.style.left = x + 'px';
      this.dialogRoot.nativeElement.style.top = y + 'px';
    } else {
      this.dialogRoot.nativeElement.style.left = this.position.left + 'px';
      this.dialogRoot.nativeElement.style.top = this.position.top + 'px';
    }
  }

  initDrag(event: MouseEvent | TouchEvent) {
    if (event.target === this.closeIcon.nativeElement) {
      return;
    }
    if (!this.maximized) {
      this.dragEventTarget = event;
    }
  }

  onResize(event: ResizableEvent) {
    if (event.direction === 'vertical') {
      this.calcBodyHeight();
    }
  }

  /**
   * 计算内容的高度
   */
  calcBodyHeight() {
    const diffHeight = this.dialogHeader.nativeElement.offsetHeight + (this.dialogFooter?.nativeElement?.offsetHeight || 0);
    const contentHeight = this.dialogRoot.nativeElement.offsetHeight - diffHeight;
    this.dialogBody.nativeElement.style.height = contentHeight + 'px';
    this.dialogBody.nativeElement.style.maxHeight = 'none';
  }

  getMaxDialogIndex() {
    return maxZIndex('.ui-dialog');
  }

  focusLastDialog() {
    const dialog = findAncestor(this.element.nativeElement.parentElement, '.ui-dialog');
    if (dialog) {
      dialog.focus();
    }
  }

  toggleMaximize(event) {
    if (this.maximized) {
      this.revertMaximize();
    } else {
      this.maximize();
    }
    event.preventDefault();
  }

  maximize() {
    this.preMaximizePageX = parseFloat(this.dialogRoot.nativeElement.style.top);
    this.preMaximizePageY = parseFloat(this.dialogRoot.nativeElement.style.left);
    this.preMaximizeRootWidth = this.dialogRoot.nativeElement.offsetWidth;
    this.preMaximizeRootHeight = this.dialogRoot.nativeElement.offsetHeight;
    this.preMaximizeBodyHeight = this.dialogBody.nativeElement.offsetHeight;

    this.dialogRoot.nativeElement.style.top = '0px';
    this.dialogRoot.nativeElement.style.left = '0px';
    this.dialogRoot.nativeElement.style.width = '100vw';
    this.dialogRoot.nativeElement.style.height = '100vh';
    const diffHeight = this.dialogHeader.nativeElement.offsetHeight + (this.dialogFooter?.nativeElement?.offsetHeight || 0);
    this.dialogBody.nativeElement.style.height = 'calc(100vh - ' + diffHeight + 'px)';
    this.dialogBody.nativeElement.style.maxHeight = 'none';

    this.maximized = true;
  }

  revertMaximize() {
    this.dialogRoot.nativeElement.style.top = this.preMaximizePageX + 'px';
    this.dialogRoot.nativeElement.style.left = this.preMaximizePageY + 'px';
    this.dialogRoot.nativeElement.style.width = this.preMaximizeRootWidth + 'px';
    this.dialogRoot.nativeElement.style.height = this.preMaximizeRootHeight + 'px';
    this.dialogBody.nativeElement.style.height = this.preMaximizeBodyHeight + 'px';

    this.maximized = false;
  }

  moveOnTop() {
    if (!this.backdrop) {
      const maxDialogIndex = this.getMaxDialogIndex();
      let zIndex = parseFloat(window.getComputedStyle(this.dialogRoot.nativeElement).zIndex) || 0;
      if (zIndex <= maxDialogIndex) {
        zIndex = maxDialogIndex + 1;
        this.dialogRoot.nativeElement.style.zIndex = zIndex.toString();
      }
    }
  }

}
