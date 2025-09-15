import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(true);
  public isCollapsed$ = this.isCollapsedSubject.asObservable();

  constructor() {
    // Load saved state from localStorage, default to collapsed if no saved state
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      this.isCollapsedSubject.next(JSON.parse(savedState));
    } else {
      // Default to collapsed if no saved state exists
      this.isCollapsedSubject.next(true);
      localStorage.setItem('sidebar-collapsed', 'true');
    }
  }

  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  toggle(): void {
    const newState = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  }

  collapse(): void {
    this.isCollapsedSubject.next(true);
    localStorage.setItem('sidebar-collapsed', 'true');
  }

  expand(): void {
    this.isCollapsedSubject.next(false);
    localStorage.setItem('sidebar-collapsed', 'false');
  }
}
