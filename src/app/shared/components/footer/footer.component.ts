import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class FooterComponent {
  appName = APP_CONSTANTS.APP_NAME;
  version = APP_CONSTANTS.VERSION;
  currentYear = new Date().getFullYear();
}
