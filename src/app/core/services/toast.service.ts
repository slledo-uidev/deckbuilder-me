import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastsSubject$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.toastsSubject$.asObservable();

  show(message: string, variant: ToastVariant = 'info', duration = 4000): void {
    const id = ++this.counter;
    const current = this.toastsSubject$.value;
    this.toastsSubject$.next([...current, { id, message, variant }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string):   void { this.show(message, 'error'); }
  info(message: string):    void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  dismiss(id: number): void {
    this.toastsSubject$.next(this.toastsSubject$.value.filter(t => t.id !== id));
  }
}
