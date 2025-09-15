import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class LoadingComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Loading...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() type: 'spinner' | 'dots' | 'pulse' = 'spinner';
}
