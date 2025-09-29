import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { APP_CONSTANTS } from '../../../../core/constants/app.constants';
import { TranslationService } from '../../../../../locale/translation.service';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { SupportedLanguage } from '../../../../../locale/translation.types';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
})
export class IntroductionComponent implements OnInit {
  currentSlide = 0;
  isAuthenticated = false;
  appConstants = APP_CONSTANTS;
  currentYear = new Date().getFullYear();

  // Translation properties
  currentLanguage: SupportedLanguage = 'en';
  isRTL = false;
  supportedLanguages: SupportedLanguage[] = [];

  slides = [
    {
      image: '/assets/images/banner2.jpeg',
      titleKey: 'introduction.slides.welcome.title',
      descriptionKey: 'introduction.slides.welcome.description',
    }
  ];

  partners = [
    {
      nameKey: 'PARTNER_HEALTH_SAFETY_NAME',
      logo: '/assets/svgs/hsi-logo.svg',
      descriptionKey: 'PARTNER_HEALTH_SAFETY_DESC',
    },
  ];

  constructor(
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) {
      this.startSlideShow();
    }

    // Initialize translation properties
    this.supportedLanguages = this.translationService.getSupportedLanguages();
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.isRTL = this.translationService.isRTL();
  }

  startSlideShow(): void {
    setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlide =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  goToLogin(): void {
    // Navigate to login page
    window.location.href = APP_CONSTANTS.ROUTES.LOGIN;
  }

  goToDashboard(): void {
    // Navigate to dashboard if already authenticated
    window.location.href = APP_CONSTANTS.ROUTES.DASHBOARD;
  }

  // Language switching methods
  switchLanguage(language: SupportedLanguage): void {
    this.translationService.setLanguage(language);
  }

  getLanguageDisplayName(language: SupportedLanguage): string {
    return language === 'en' ? 'English' : 'العربية';
  }

  // Navigation methods
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
