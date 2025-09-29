import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  TranslationKeys,
  SupportedLanguage,
  TranslationConfig,
} from './translation.types';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLanguage$ = new BehaviorSubject<SupportedLanguage>('en');
  private translations: Map<SupportedLanguage, TranslationKeys> = new Map();
  private translationsLoaded$ = new BehaviorSubject<boolean>(false);

  private config: TranslationConfig = {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    fallbackLanguage: 'en',
  };

  constructor(private http: HttpClient) {
    console.log('[TranslationService] Constructor called');
    // Set fallback translations immediately
    this.setFallbackTranslations();
    // Initialize language
    this.initializeLanguage();
    // Then load translations from files
    this.loadTranslations();
    
    // Force a test translation to ensure service is working
    setTimeout(() => {
      const testResult = this.translate('login.title', { appName: 'Test' });
      console.log('[TranslationService] Test translation in constructor:', testResult);
      
      // Test a few more keys
      const testKeys = [
        'login.features.title',
        'login.features.subtitle',
        'login.features.courseLibrary.title',
        'login.features.courseLibrary.description'
      ];
      
      testKeys.forEach(key => {
        const result = this.translate(key, { appName: 'Test' });
        console.log(`[TranslationService] Test translation for ${key}:`, result);
      });
    }, 100);
  }

  private loadTranslations(): void {
    console.log('[TranslationService] Loading translations from files');
    
    // Try to load from files, but don't wait for them
    this.http.get<TranslationKeys>('/assets/i18n/en.json').subscribe({
      next: (translations) => {
        this.translations.set('en', translations);
        this.translationsLoaded$.next(true);
        console.log('[TranslationService] EN translations loaded from file');
      },
      error: (error) => {
        console.warn('[TranslationService] Could not load EN translations from file:', error);
        // Keep fallback translations and mark as loaded
        this.translationsLoaded$.next(true);
      }
    });
    
    this.http.get<TranslationKeys>('/assets/i18n/ar.json').subscribe({
      next: (translations) => {
        this.translations.set('ar', translations);
        this.translationsLoaded$.next(true);
        console.log('[TranslationService] AR translations loaded from file');
      },
      error: (error) => {
        console.warn('[TranslationService] Could not load AR translations from file:', error);
        // Keep fallback translations and mark as loaded
        this.translationsLoaded$.next(true);
      }
    });
  }

  private setFallbackTranslations(): void {
    console.log('[TranslationService] Setting fallback translations');
    const fallbackEn: TranslationKeys = {
      'login.title': 'Welcome to {{appName}}',
      'login.form.civilNumber.label': 'Civil Number',
      'login.form.civilNumber.placeholder': 'Enter your 12-digit civil number',
      'login.form.civilNumber.errors.required': 'Civil number is required',
      'login.form.civilNumber.errors.minlength': 'Civil number must be 12 digits',
      'login.form.civilNumber.errors.maxlength': 'Civil number must be 12 digits',
      'login.form.civilNo.label': 'Civil Number',
      'login.form.civilNo.placeholder': 'Enter your 12-digit civil number',
      'login.form.civilNo.errors.required': 'Civil number is required',
      'login.form.civilNo.errors.minlength': 'Civil number must be 12 digits',
      'login.form.civilNo.errors.maxlength': 'Civil number must be 12 digits',
      'login.form.password.label': 'Password',
      'login.form.password.placeholder': 'Enter your password',
      'login.form.password.errors.required': 'Password is required',
      'login.form.password.errors.minlength': 'Password must be at least 6 characters',
      'login.form.rememberMe': 'Remember me',
      'login.form.signIn': 'Sign In',
      'login.form.signingIn': 'Signing In...',
      'login.form.loginError': 'Invalid credentials. Please try again.',
      'login.features.title': 'Why Choose {{appName}}?',
      'login.features.subtitle': 'Experience world-class training and professional development',
      'login.features.courseLibrary.title': 'Comprehensive Course Library',
      'login.features.courseLibrary.description': 'Access hundreds of professional training courses across various industries and skill levels.',
      'login.features.certifications.title': 'Industry Certifications',
      'login.features.certifications.description': 'Earn recognized certifications that boost your career prospects and professional credibility.',
      'login.features.collaborativeLearning.title': 'Collaborative Learning',
      'login.features.collaborativeLearning.description': 'Join a community of learners and collaborate with peers and industry experts.',
      'login.footer.copyright': '© {{year}} {{organization}}. All rights reserved.',
      'LANGUAGE_ENGLISH': 'English',
      'LANGUAGE_ARABIC': 'العربية'
    } as any;

    const fallbackAr: TranslationKeys = {
      'login.title': 'مرحباً بك في {{appName}}',
      'login.form.civilNumber.label': 'الرقم المدني',
      'login.form.civilNumber.placeholder': 'أدخل رقمك المدني المكون من 12 رقماً',
      'login.form.civilNumber.errors.required': 'الرقم المدني مطلوب',
      'login.form.civilNumber.errors.minlength': 'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.civilNumber.errors.maxlength': 'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.civilNo.label': 'الرقم المدني',
      'login.form.civilNo.placeholder': 'أدخل رقمك المدني المكون من 12 رقماً',
      'login.form.civilNo.errors.required': 'الرقم المدني مطلوب',
      'login.form.civilNo.errors.minlength': 'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.civilNo.errors.maxlength': 'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.password.label': 'كلمة المرور',
      'login.form.password.placeholder': 'أدخل كلمة المرور',
      'login.form.password.errors.required': 'كلمة المرور مطلوبة',
      'login.form.password.errors.minlength': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      'login.form.rememberMe': 'تذكرني',
      'login.form.signIn': 'تسجيل الدخول',
      'login.form.signingIn': 'جارٍ تسجيل الدخول...',
      'login.form.loginError': 'بيانات اعتماد غير صحيحة. يرجى المحاولة مرة أخرى.',
      'login.features.title': 'لماذا تختار {{appName}}؟',
      'login.features.subtitle': 'استمتع بتدريب عالمي المستوى وتطوير مهني متميز',
      'login.features.courseLibrary.title': 'مكتبة شاملة للدورات',
      'login.features.courseLibrary.description': 'الوصول إلى مئات الدورات التدريبية المهنية عبر مختلف الصناعات ومستويات المهارة.',
      'login.features.certifications.title': 'شهادات معتمدة',
      'login.features.certifications.description': 'احصل على شهادات معترف بها تعزز آفاقك المهنية ومصداقيتك المهنية.',
      'login.features.collaborativeLearning.title': 'التعلم التعاوني',
      'login.features.collaborativeLearning.description': 'انضم إلى مجتمع المتعلمين وتعاون مع الزملاء وخبراء الصناعة.',
      'login.footer.copyright': '© {{year}} {{organization}}. جميع الحقوق محفوظة.',
      'LANGUAGE_ENGLISH': 'English',
      'LANGUAGE_ARABIC': 'العربية'
    } as any;

    this.translations.set('en', fallbackEn);
    this.translations.set('ar', fallbackAr);
    this.translationsLoaded$.next(true);
    console.log('[TranslationService] Fallback translations set, loaded state:', this.translationsLoaded$.value);
    
    // Test a few translations immediately
    const testKeys = [
      'login.features.title',
      'login.features.subtitle',
      'login.features.courseLibrary.title',
      'login.features.courseLibrary.description'
    ];
    
    testKeys.forEach(key => {
      const result = this.translate(key, { appName: 'Test' });
      console.log(`[TranslationService] Immediate test for ${key}:`, result);
    });
  }

  private initializeLanguage(): void {
    // Get language from localStorage or browser language
    const savedLanguage = localStorage.getItem(
      'app-language'
    ) as SupportedLanguage;
    const browserLanguage = this.getBrowserLanguage();

    const language =
      savedLanguage && this.config.supportedLanguages.includes(savedLanguage)
        ? savedLanguage
        : browserLanguage;

    this.setLanguage(language);
  }

  private getBrowserLanguage(): SupportedLanguage {
    const browserLang = navigator.language.split('-')[0];
    return this.config.supportedLanguages.includes(
      browserLang as SupportedLanguage
    )
      ? (browserLang as SupportedLanguage)
      : this.config.defaultLanguage;
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage$.value;
  }

  getCurrentLanguage$(): Observable<SupportedLanguage> {
    return this.currentLanguage$.asObservable();
  }

  setLanguage(language: SupportedLanguage): void {
    if (this.config.supportedLanguages.includes(language)) {
      this.currentLanguage$.next(language);
      localStorage.setItem('app-language', language);
      this.setDocumentDirection(language);
    }
  }

  private setDocumentDirection(language: SupportedLanguage): void {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }

  translate(key: string, params?: Record<string, any>): string {
    const currentLang = this.currentLanguage$.value;
    
    // If translations are not loaded yet, return the key
    if (!this.translationsLoaded$.value) {
      return key;
    }
    
    const translation = this.getTranslationByKey(key, currentLang);

    if (!translation) {
      console.warn(
        `Translation missing for key: ${key} in language: ${currentLang}`
      );
      return key;
    }

    const result = this.interpolateParams(translation, params);
    return result;
  }

  private getTranslationByKey(
    key: string,
    language: SupportedLanguage
  ): string | null {
    const translations =
      this.translations.get(language) ||
      this.translations.get(this.config.fallbackLanguage);
    
    if (!translations) {
      return null;
    }

    // First try direct key lookup (for flat keys like 'login.title')
    if (key in translations) {
      return typeof (translations as any)[key] === 'string' ? (translations as any)[key] : null;
    }

    // Then try nested key lookup (for keys like 'login.form.title')
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return null;
      }
    }

    return typeof result === 'string' ? result : null;
  }

  private interpolateParams(
    text: string,
    params?: Record<string, any>
  ): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match;
    });
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.config.supportedLanguages];
  }

  isRTL(): boolean {
    return this.currentLanguage$.value === 'ar';
  }

  isRTL$(): Observable<boolean> {
    return new BehaviorSubject(this.isRTL());
  }

  getTranslationsLoaded$(): Observable<boolean> {
    return this.translationsLoaded$.asObservable();
  }
}
