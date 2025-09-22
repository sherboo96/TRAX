import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DepartmentTreeNode } from '../../../core/models/department-tree.model';

@Component({
  selector: 'app-department-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-node" [style.margin-left.px]="level * 20">
      <!-- Node Content -->
      <div class="node-wrapper" [class.has-children]="node.hasChildren">
        <!-- Expand/Collapse Button -->
        <button
          *ngIf="node.hasChildren"
          class="expand-button"
          (click)="toggleNode()"
          [class.expanded]="node.isExpanded"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <!-- Node Content -->
        <div class="node-content" (click)="toggleNode()">
          <div class="node-main">
            <i [class]="getNodeIcon(node.type)" class="node-icon"></i>
            <span class="node-name">{{ node.nameEn }}</span>
            <span class="node-type">{{ node.type }}</span>
            <span
              class="node-status"
              [class.active]="node.isActive"
              [class.inactive]="!node.isActive"
            >
              {{ node.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="node-details">
            <span class="organization">{{ node.organizationName }}</span>
            <span class="level">Level {{ node.level }}</span>
            <span *ngIf="node.hasChildren" class="children-count">
              {{ node.children.length }} children
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="node-actions">
          <button
            class="action-btn edit-btn"
            (click)="onActionClick('edit', $event)"
            title="Edit Department"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            class="action-btn delete-btn"
            (click)="onActionClick('delete', $event)"
            title="Delete Department"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Children -->
      <div
        *ngIf="node.isExpanded && node.hasChildren"
        class="children-container"
      >
        <div class="children-line"></div>
        <div class="children-list">
          <app-department-tree-node
            *ngFor="let child of node.children; trackBy: trackByNodeId"
            [node]="child"
            [level]="level + 1"
            (toggle)="onChildToggle($event)"
            (actionClick)="onChildActionClick($event)"
          ></app-department-tree-node>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tree-node {
        position: relative;
      }

      .node-wrapper {
        display: flex;
        align-items: center;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin: 4px 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        position: relative;
      }

      .node-wrapper:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .node-wrapper.has-children {
        border-left: 4px solid #667eea;
      }

      .expand-button {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .expand-button:hover {
        background: #edf2f7;
        border-color: #cbd5e0;
      }

      .expand-button.expanded {
        background: #667eea;
        color: white;
        border-color: #5a67d8;
      }

      .expand-button i {
        transition: transform 0.3s ease;
      }

      .expand-button.expanded i {
        transform: rotate(90deg);
      }

      .node-content {
        flex: 1;
        padding: 12px 16px;
        cursor: pointer;
        min-height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .node-main {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 6px;
      }

      .node-icon {
        font-size: 16px;
        color: #4a5568;
        width: 20px;
        text-align: center;
      }

      .node-name {
        font-weight: 600;
        font-size: 15px;
        color: #2d3748;
        flex: 1;
      }

      .node-type {
        background: #edf2f7;
        color: #4a5568;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .node-status {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
      }

      .node-status.active {
        background: #c6f6d5;
        color: #22543d;
      }

      .node-status.inactive {
        background: #fed7d7;
        color: #742a2a;
      }

      .node-details {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: #718096;
        flex-wrap: wrap;
      }

      .organization {
        font-weight: 500;
      }

      .level {
        background: #f7fafc;
        padding: 2px 6px;
        border-radius: 3px;
      }

      .children-count {
        background: #e6fffa;
        color: #234e52;
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: 500;
      }

      .node-actions {
        display: flex;
        gap: 4px;
        padding: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .node-wrapper:hover .node-actions {
        opacity: 1;
      }

      .action-btn {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 12px;
      }

      .action-btn:hover {
        transform: scale(1.1);
      }

      .edit-btn {
        color: #3182ce;
      }

      .edit-btn:hover {
        background: #ebf8ff;
        border-color: #90cdf4;
      }

      .delete-btn {
        color: #e53e3e;
      }

      .delete-btn:hover {
        background: #fed7d7;
        border-color: #feb2b2;
      }

      .children-container {
        position: relative;
        margin-left: 20px;
      }

      .children-line {
        position: absolute;
        left: -20px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e2e8f0;
      }

      .children-list {
        position: relative;
      }

      .children-list::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 0;
        width: 20px;
        height: 2px;
        background: #e2e8f0;
      }

      @media (max-width: 768px) {
        .node-main {
          flex-wrap: wrap;
          gap: 8px;
        }

        .node-details {
          flex-direction: column;
          gap: 8px;
        }

        .node-actions {
          opacity: 1;
        }
      }
    `,
  ],
})
export class DepartmentTreeNodeComponent {
  @Input() node!: DepartmentTreeNode;
  @Input() level: number = 0;
  @Output() toggle = new EventEmitter<DepartmentTreeNode>();
  @Output() actionClick = new EventEmitter<{
    action: string;
    node: DepartmentTreeNode;
  }>();

  trackByNodeId(index: number, node: DepartmentTreeNode): number {
    return node.id;
  }

  toggleNode(): void {
    if (this.node.hasChildren) {
      this.node.isExpanded = !this.node.isExpanded;
      this.toggle.emit(this.node);
    }
  }

  onChildToggle(childNode: DepartmentTreeNode): void {
    this.toggle.emit(childNode);
  }

  onActionClick(action: string, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action, node: this.node });
  }

  onChildActionClick(event: {
    action: string;
    node: DepartmentTreeNode;
  }): void {
    this.actionClick.emit(event);
  }

  getNodeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      Dep: 'fas fa-building',
      Div: 'fas fa-sitemap',
      Sec: 'fas fa-folder',
    };
    return iconMap[type] || 'fas fa-circle';
  }
}
