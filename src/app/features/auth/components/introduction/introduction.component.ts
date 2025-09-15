import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { APP_CONSTANTS } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class IntroductionComponent implements OnInit {
  currentSlide = 0;
  autoplayInterval: any;
  isAuthenticated = false;
  currentYear = new Date().getFullYear();
  appConstants = APP_CONSTANTS;

  slides = [
    {
      title: 'Welcome to Oil Training Center',
      subtitle: 'Empowering Excellence in Oil & Gas Training',
      description:
        'Discover comprehensive training programs designed to enhance skills and knowledge in the oil and gas industry.',
      image: 'assets/images/logos/OTC.png',
      icon: '🏭',
      features: [
        'Professional Certification Programs',
        'Industry Expert Instructors',
        'Hands-on Practical Training',
        'Flexible Learning Options',
      ],
    },
    {
      title: 'Our Mission',
      subtitle: "Building Tomorrow's Industry Leaders",
      description:
        'We are committed to providing world-class training and development opportunities for professionals in the oil and gas sector.',
      image: 'assets/images/logos/OTC.png',
      icon: '🎯',
      features: [
        'Quality Education Standards',
        'Industry-Relevant Curriculum',
        'Continuous Professional Development',
        'Global Best Practices',
      ],
    },
    {
      title: 'Training Programs',
      subtitle: 'Comprehensive Learning Solutions',
      description:
        'From technical skills to leadership development, our programs cover all aspects of the oil and gas industry.',
      image: 'assets/images/logos/OTC.png',
      icon: '📚',
      features: [
        'Technical Skills Training',
        'Safety & Compliance Courses',
        'Management & Leadership',
        'Digital Transformation',
      ],
    },
    {
      title: 'Why Choose OTC?',
      subtitle: 'Excellence in Every Detail',
      description:
        'Join thousands of professionals who trust OTC for their career advancement and skill development needs.',
      image: 'assets/images/logos/OTC.png',
      icon: '⭐',
      features: [
        'Proven Track Record',
        'Expert Faculty',
        'Modern Facilities',
        'Career Support Services',
      ],
    },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
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
}
