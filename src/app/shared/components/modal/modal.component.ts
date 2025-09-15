import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      (click)="onBackdropClick($event)"
    >
      <div
        [ngClass]="width"
        class="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in"
      >
        <div
          class="px-6 py-4 border-b border-neutral-200 flex justify-between items-center"
        >
          <h3 class="text-lg font-semibold text-neutral-900">{{ title }}</h3>
          <button
            (click)="close.emit()"
            class="text-neutral-400 hover:text-neutral-600"
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
        <div class="px-6 py-4">
          <ng-content></ng-content>
        </div>
        <div
          class="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3"
        >
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.2s;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.98);
        }
        to {
          opacity: 1;
          transform: scale(1);
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
