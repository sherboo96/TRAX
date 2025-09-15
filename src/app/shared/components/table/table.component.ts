import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  header: string;
  field: string;
  cellTemplate?: TemplateRef<any>;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead
            class="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-primary-200"
          >
            <tr>
              <th
                *ngFor="let col of columns"
                class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider"
              >
                {{ col.header }}
              </th>
              <th
                *ngIf="actions?.length"
                class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              *ngFor="let row of data; let i = index"
              class="hover:bg-primary-50 transition-colors duration-200 group"
              [class.bg-neutral-25]="i % 2 === 0"
            >
              <ng-container *ngFor="let col of columns">
                <td class="px-6 py-4 whitespace-nowrap">
                  <ng-container *ngIf="col.cellTemplate; else defaultCell">
                    <ng-container
                      *ngTemplateOutlet="
                        col.cellTemplate;
                        context: { $implicit: row }
                      "
                    ></ng-container>
                  </ng-container>
                  <ng-template #defaultCell>
                    <span class="text-sm text-neutral-800">{{
                      row[col.field]
                    }}</span>
                  </ng-template>
                </td>
              </ng-container>
              <td *ngIf="actions?.length" class="px-6 py-4 whitespace-nowrap">
                <div
                  class="flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ng-container *ngFor="let action of actions">
                    <button
                      (click)="onAction(action.name, row)"
                      class="p-2 rounded-lg hover:bg-primary-100 transition-all duration-200 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      [ngClass]="action.class"
                      [title]="action.name | titlecase"
                      [attr.aria-label]="action.name"
                      type="button"
                    >
                      <span
                        *ngIf="action.svg; else iconTpl"
                        [innerHTML]="action.svg"
                        class="w-4 h-4"
                      ></span>
                      <ng-template #iconTpl>
                        <i *ngIf="action.icon" [ngClass]="action.icon"></i>
                      </ng-template>
                    </button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!data?.length" class="text-center py-12">
        <div
          class="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4"
        >
          <svg
            class="w-8 h-8 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-neutral-800 mb-2">
          No data available
        </h3>
        <p class="text-neutral-500">
          There are no items to display at the moment.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .bg-neutral-25 {
        background-color: #fafafa;
      }

      /* Custom scrollbar for webkit browsers */
      .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
      }

      .overflow-x-auto::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 3px;
      }

      .overflow-x-auto::-webkit-scrollbar-thumb {
        background: #0b5668;
        border-radius: 3px;
      }

      .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: #094555;
      }
    `,
  ],
})
export class TableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: {
    label?: string;
    icon?: string;
    class?: string;
    name: string;
    svg?: string;
  }[] = [];
  @Output() action = new EventEmitter<{ name: string; row: any }>();

  onAction(name: string, row: any) {
    console.log('Table action clicked:', name, row);
    this.action.emit({ name, row });
  }

  ngOnInit() {
    console.log('Table component initialized with actions:', this.actions);
    console.log('Table component data:', this.data);
    console.log('Table component columns:', this.columns);
    console.log('Table component data length:', this.data?.length);
  }
}
