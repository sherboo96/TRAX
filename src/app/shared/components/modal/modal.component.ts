import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition"
      (click)="onBackdropClick($event)"
    >
      <div
        [ngClass]="width"
        class="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in transform transition-all"
      >
        <div
          class="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-gradient-to-r from-neutral-50 to-white"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center"
            >
              <i class="fas fa-edit text-xs"></i>
            </div>
            <h3 class="text-lg font-semibold text-neutral-900">{{ title }}</h3>
          </div>
          <button
            (click)="close.emit()"
            class="text-neutral-400 hover:text-neutral-700 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
            title="Close (Esc)"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="px-6 py-5">
          <ng-content></ng-content>
        </div>
        <div
          class="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between"
        >
          <div class="text-xs text-neutral-500">Press Esc to close</div>
          <div class="flex justify-end gap-3">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.18s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(6px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class ModalComponent {
  @Input() title = '';
  @Input() show = false;
  @Input() width = 'w-full max-w-lg';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
