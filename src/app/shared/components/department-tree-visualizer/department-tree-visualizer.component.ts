import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DepartmentTreeNodeComponent } from '../department-tree-node/department-tree-node.component';
import { DepartmentTreeNode } from '../../../core/models/department-tree.model';

@Component({
  selector: 'app-department-tree-visualizer',
  standalone: true,
  imports: [CommonModule, DepartmentTreeNodeComponent],
  template: `
    <div class="department-tree-container">
      <!-- Root Department -->
      <div *ngIf="rootDepartment" class="root-department">
        <div class="department-node root-node">
          <div class="node-content">
            <div class="node-header">
              <i
                [class]="getNodeIcon(rootDepartment.type)"
                class="node-icon"
              ></i>
              <span class="node-name">{{ rootDepartment.nameEn }}</span>
              <span class="node-type">{{ rootDepartment.type }}</span>
              <span
                class="node-status"
                [class.active]="rootDepartment.isActive"
                [class.inactive]="!rootDepartment.isActive"
              >
                {{ rootDepartment.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="node-details">
              <span class="organization">{{
                rootDepartment.organizationName
              }}</span>
              <span class="level">Level: {{ rootDepartment.level }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tree Structure -->
      <div class="tree-structure">
        <div
          *ngFor="let node of treeNodes; trackBy: trackByNodeId"
          class="tree-branch"
        >
          <app-department-tree-node
            [node]="node"
            [level]="0"
            (toggle)="onNodeToggle($event)"
            (actionClick)="onActionClick($event)"
          ></app-department-tree-node>
        </div>
      </div>

      <!-- Summary -->
      <div class="tree-summary">
        <div class="summary-item">
          <i class="fas fa-sitemap"></i>
          <span>Total Nodes: {{ totalNodes }}</span>
        </div>
        <div class="summary-item">
          <i class="fas fa-layer-group"></i>
          <span>Max Depth: {{ maxDepth }}</span>
        </div>
        <div class="summary-item">
          <i class="fas fa-check-circle"></i>
          <span>Active: {{ activeCount }}</span>
        </div>
        <div class="summary-item">
          <i class="fas fa-times-circle"></i>
          <span>Inactive: {{ inactiveCount }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .department-tree-container {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .root-department {
        margin-bottom: 20px;
      }

      .root-node {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: 2px solid #5a67d8;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .department-node {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin: 8px 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }

      .department-node:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .node-content {
        padding: 16px;
      }

      .node-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .node-icon {
        font-size: 18px;
        color: #4a5568;
      }

      .root-node .node-icon {
        color: white;
      }

      .node-name {
        font-weight: 600;
        font-size: 16px;
        color: #2d3748;
      }

      .root-node .node-name {
        color: white;
        font-size: 18px;
      }

      .node-type {
        background: #edf2f7;
        color: #4a5568;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }

      .root-node .node-type {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .node-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
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

      .root-node .node-status {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .node-details {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: #718096;
      }

      .root-node .node-details {
        color: rgba(255, 255, 255, 0.8);
      }

      .tree-structure {
        margin-left: 20px;
        border-left: 2px solid #e2e8f0;
        padding-left: 20px;
      }

      .tree-summary {
        margin-top: 30px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        display: flex;
        gap: 30px;
        flex-wrap: wrap;
      }

      .summary-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #4a5568;
        font-weight: 500;
      }

      .summary-item i {
        color: #667eea;
        font-size: 16px;
      }

      @media (max-width: 768px) {
        .tree-summary {
          flex-direction: column;
          gap: 15px;
        }

        .node-header {
          flex-wrap: wrap;
        }

        .node-details {
          flex-direction: column;
          gap: 8px;
        }
      }
    `,
  ],
})
export class DepartmentTreeVisualizerComponent {
  @Input() rootDepartment: DepartmentTreeNode | null = null;
  @Input() treeNodes: DepartmentTreeNode[] = [];
  @Input() totalNodes: number = 0;
  @Input() maxDepth: number = 0;
  @Input() activeCount: number = 0;
  @Input() inactiveCount: number = 0;

  @Output() toggle = new EventEmitter<DepartmentTreeNode>();
  @Output() actionClick = new EventEmitter<{
    action: string;
    node: DepartmentTreeNode;
  }>();

  trackByNodeId(index: number, node: DepartmentTreeNode): number {
    return node.id;
  }

  onNodeToggle(node: DepartmentTreeNode): void {
    this.toggle.emit(node);
  }

  onActionClick(event: { action: string; node: DepartmentTreeNode }): void {
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
