import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnChanges, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() title: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showCloseButton: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = false;
  
  @Output() closed = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      document.body.style.overflow = changes['isVisible'].currentValue ? 'hidden' : '';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isVisible) {
      this.onClose();
    }
  }

  onBackdropClick(): void {
    this.onClose();
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  onClose(): void {
    this.closed.emit();
  }
}
