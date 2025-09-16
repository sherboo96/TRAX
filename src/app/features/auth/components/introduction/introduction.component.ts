import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { APP_CONSTANTS } from '../../../../core/constants/app.constants';
import { TranslationService } from '../../../../../locale/translation.service';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { SupportedLanguage } from '../../../../../locale/translation.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
})
export class IntroductionComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  autoplayInterval: any;
  isAuthenticated = false;
  currentYear = new Date().getFullYear();
  appConstants = APP_CONSTANTS;

  // Translation properties
  currentLanguage: SupportedLanguage = 'en';
  isRTL = false;
  supportedLanguages: SupportedLanguage[] = [];
  private subscription = new Subscription();

  slides = [
    {
      titleKey: 'introduction.slides.welcome.title',
      subtitleKey: 'introduction.slides.welcome.subtitle',
      descriptionKey: 'introduction.slides.welcome.description',
      image: 'assets/images/logos/OTC.png',
      icon: '🏭',
      featuresKey: 'introduction.slides.welcome.features',
    },
    {
      titleKey: 'introduction.slides.mission.title',
      subtitleKey: 'introduction.slides.mission.subtitle',
      descriptionKey: 'introduction.slides.mission.description',
      image: 'assets/images/logos/OTC.png',
      icon: '🎯',
      featuresKey: 'introduction.slides.mission.features',
    },
    {
      titleKey: 'introduction.slides.programs.title',
      subtitleKey: 'introduction.slides.programs.subtitle',
      descriptionKey: 'introduction.slides.programs.description',
      image: 'assets/images/logos/OTC.png',
      icon: '📚',
      featuresKey: 'introduction.slides.programs.features',
    },
    {
      titleKey: 'introduction.slides.whyChoose.title',
      subtitleKey: 'introduction.slides.whyChoose.subtitle',
      descriptionKey: 'introduction.slides.whyChoose.description',
      image: 'assets/images/logos/OTC.png',
      icon: '⭐',
      featuresKey: 'introduction.slides.whyChoose.features',
    },
  ];

  constructor(
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) {
      this.startAutoplay();
    }

    // Initialize translation properties
    this.supportedLanguages = this.translationService.getSupportedLanguages();
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.isRTL = this.translationService.isRTL();

    // Subscribe to language changes
    this.subscription.add(
      this.translationService.getCurrentLanguage$().subscribe((language) => {
        this.currentLanguage = language;
        this.isRTL = this.translationService.isRTL();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
    this.subscription.unsubscribe();
  }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  previousSlide(): void {
    this.currentSlide =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  onSlideInteraction(): void {
    // Reset autoplay when user interacts with slides
    this.stopAutoplay();
    this.startAutoplay();
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
}
