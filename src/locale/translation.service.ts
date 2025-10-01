import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SupportedLanguage,
  TranslationConfig,
  TranslationKeys,
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
    // Initialize language
    this.initializeLanguage();
    // Load translations from files
    this.loadTranslations();
  }

  private loadTranslations(): void {
    console.log('[TranslationService] Loading translations from files');

    let loadedCount = 0;
    const totalLanguages = this.config.supportedLanguages.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalLanguages) {
        this.translationsLoaded$.next(true);
        console.log('[TranslationService] All translations loaded');
      }
    };

    // Load English translations
    this.http.get<TranslationKeys>('/assets/i18n/en.json').subscribe({
      next: (translations) => {
        this.translations.set('en', translations);
        console.log('[TranslationService] EN translations loaded from file');
        checkAllLoaded();
      },
      error: (error) => {
        console.error(
          '[TranslationService] Could not load EN translations from file:',
          error
        );
        checkAllLoaded();
      },
    });

    // Load Arabic translations
    this.http.get<TranslationKeys>('/assets/i18n/ar.json').subscribe({
      next: (translations) => {
        this.translations.set('ar', translations);
        console.log('[TranslationService] AR translations loaded from file');
        checkAllLoaded();
      },
      error: (error) => {
        console.error(
          '[TranslationService] Could not load AR translations from file:',
          error
        );
        checkAllLoaded();
      },
    });
  }

  private setFallbackTranslations(): void {
    console.log('[TranslationService] Setting fallback translations');
    const fallbackEn: TranslationKeys = {
      'login.title': 'Welcome to {{appName}}',
      'login.form.civilNumber.label': 'Civil Number',
      'login.form.civilNumber.placeholder': 'Enter your 12-digit civil number',
      'login.form.civilNumber.errors.required': 'Civil number is required',
      'login.form.civilNumber.errors.minlength':
        'Civil number must be 12 digits',
      'login.form.civilNumber.errors.maxlength':
        'Civil number must be 12 digits',
      'login.form.civilNo.label': 'Civil Number',
      'login.form.civilNo.placeholder': 'Enter your 12-digit civil number',
      'login.form.civilNo.errors.required': 'Civil number is required',
      'login.form.civilNo.errors.minlength': 'Civil number must be 12 digits',
      'login.form.civilNo.errors.maxlength': 'Civil number must be 12 digits',
      'login.form.password.label': 'Password',
      'login.form.password.placeholder': 'Enter your password',
      'login.form.password.errors.required': 'Password is required',
      'login.form.password.errors.minlength':
        'Password must be at least 6 characters',
      'login.form.rememberMe': 'Remember me',
      'login.form.signIn': 'Sign In',
      'login.form.signingIn': 'Signing In...',
      'login.form.loginError': 'Invalid credentials. Please try again.',
      'login.features.title': 'Why Choose {{appName}}?',
      'login.features.subtitle':
        'Experience world-class training and professional development',
      'login.features.courseLibrary.title': 'Comprehensive Course Library',
      'login.features.courseLibrary.description':
        'Access hundreds of professional training courses across various industries and skill levels.',
      'login.features.certifications.title': 'Industry Certifications',
      'login.features.certifications.description':
        'Earn recognized certifications that boost your career prospects and professional credibility.',
      'login.features.collaborativeLearning.title': 'Collaborative Learning',
      'login.features.collaborativeLearning.description':
        'Join a community of learners and collaborate with peers and industry experts.',
      'login.footer.copyright':
        '© {{year}} {{organization}}. All rights reserved.',
      LANGUAGE_ENGLISH: 'English',
      LANGUAGE_ARABIC: 'العربية',
      'adminAddCourse.sections.basic': 'Basic Information',
      'adminAddCourse.sections.basicSubtitle':
        'Start by providing the essential details about your course',
      'adminAddCourse.sections.schedule': 'Schedule & Duration',
      'adminAddCourse.sections.details': 'Course Details',
      'adminAddCourse.sections.content': 'Content & Assignments',
      'common.edit': 'Edit',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.confirm': 'Confirm',
      'common.close': 'Close',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.updated': 'Updated',
      'adminCourses.title': 'Courses',
      'adminCourses.enrolled': 'enrolled',
      'courses.details.certificate': 'Certificate',
      'courses.details.template': 'Template',
      'courses.details.downloadTemplate': 'Download Template',
      'courses.details.registrationCloses': 'Registration Closes:',
      'courses.details.enrollmentRejectedTitle': 'Enrollment Rejected',
      'courses.details.enrollmentRejectedMessage':
        'Your enrollment request has been rejected.',
      'courseDetails.tabs.overview': 'Overview',
      'courseDetails.tabs.curriculum': 'Curriculum',
      'courseDetails.tabs.instructor': 'Instructor',
      'courseDetails.overview.whatYoullLearn': "What you'll learn",
      'courseDetails.overview.requirements': 'Requirements',
      'courseDetails.overview.description': 'Description',
      'courseDetails.curriculum.title': 'Curriculum',
      'courseDetails.curriculum.resources': 'resources',
      'courseDetails.curriculum.totalLength': 'total length',
      'courseDetails.curriculum.showLess': 'Show Less',
      'courseDetails.curriculum.showMore': 'Show More',
      'courseDetails.instructor.title': 'Instructor',
      'courseDetails.instructor.students': 'students',
      'courseDetails.instructor.rating': 'rating',
      'courseDetails.instructor.courses': 'courses',
      'courseDetails.card.title': 'Course Information',
      'courseDetails.card.location': 'Location',
      'courseDetails.card.start': 'Start Date',
      'courseDetails.card.end': 'End Date',
      'courseDetails.card.time': 'Time',
      'courseDetails.card.seats': 'Seats',
      'courseDetails.card.category': 'Category',
      'courseDetails.card.onlineRepeated': 'Online/Repeated',
      'courseDetails.card.kpiWeight': 'KPI Weight',
      'courseDetails.card.notSet': 'Not Set',
    } as any;

    const fallbackAr: TranslationKeys = {
      'login.title': 'مرحباً بك في {{appName}}',
      'login.form.civilNumber.label': 'الرقم المدني',
      'login.form.civilNumber.placeholder':
        'أدخل رقمك المدني المكون من 12 رقماً',
      'login.form.civilNumber.errors.required': 'الرقم المدني مطلوب',
      'login.form.civilNumber.errors.minlength':
        'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.civilNumber.errors.maxlength':
        'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.civilNo.label': 'الرقم المدني',
      'login.form.civilNo.placeholder': 'أدخل رقمك المدني المكون من 12 رقماً',
      'login.form.civilNo.errors.required': 'الرقم المدني مطلوب',
      'login.form.civilNo.errors.minlength':
        'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.civilNo.errors.maxlength':
        'الرقم المدني يجب أن يكون 12 رقماً',
      'login.form.password.label': 'كلمة المرور',
      'login.form.password.placeholder': 'أدخل كلمة المرور',
      'login.form.password.errors.required': 'كلمة المرور مطلوبة',
      'login.form.password.errors.minlength':
        'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      'login.form.rememberMe': 'تذكرني',
      'login.form.signIn': 'تسجيل الدخول',
      'login.form.signingIn': 'جارٍ تسجيل الدخول...',
      'login.form.loginError':
        'بيانات اعتماد غير صحيحة. يرجى المحاولة مرة أخرى.',
      'login.features.title': 'لماذا تختار {{appName}}؟',
      'login.features.subtitle':
        'استمتع بتدريب عالمي المستوى وتطوير مهني متميز',
      'login.features.courseLibrary.title': 'مكتبة شاملة للدورات',
      'login.features.courseLibrary.description':
        'الوصول إلى مئات الدورات التدريبية المهنية عبر مختلف الصناعات ومستويات المهارة.',
      'login.features.certifications.title': 'شهادات معتمدة',
      'login.features.certifications.description':
        'احصل على شهادات معترف بها تعزز آفاقك المهنية ومصداقيتك المهنية.',
      'login.features.collaborativeLearning.title': 'التعلم التعاوني',
      'login.features.collaborativeLearning.description':
        'انضم إلى مجتمع المتعلمين وتعاون مع الزملاء وخبراء الصناعة.',
      'login.footer.copyright':
        '© {{year}} {{organization}}. جميع الحقوق محفوظة.',
      LANGUAGE_ENGLISH: 'English',
      LANGUAGE_ARABIC: 'العربية',
      'adminAddCourse.sections.basic': 'المعلومات الأساسية',
      'adminAddCourse.sections.basicSubtitle':
        'ابدأ بتقديم التفاصيل الأساسية عن دورتك',
      'adminAddCourse.sections.schedule': 'الجدول والمدة',
      'adminAddCourse.sections.details': 'تفاصيل الدورة',
      'adminAddCourse.sections.content': 'المحتوى والتكليفات',
      'common.edit': 'تعديل',
      'common.cancel': 'إلغاء',
      'common.save': 'حفظ',
      'common.delete': 'حذف',
      'common.confirm': 'تأكيد',
      'common.close': 'إغلاق',
      'common.loading': 'جارٍ التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      'common.updated': 'تم التحديث',
      'adminCourses.title': 'الدورات',
      'adminCourses.enrolled': 'مسجل',
      'courses.details.certificate': 'الشهادة',
      'courses.details.template': 'قالب',
      'courses.details.downloadTemplate': 'تحميل القالب',
      'courses.details.registrationCloses': 'ينتهي التسجيل:',
      'courses.details.enrollmentRejectedTitle': 'تم رفض التسجيل',
      'courses.details.enrollmentRejectedMessage':
        'تم رفض طلب التسجيل الخاص بك.',
      'courseDetails.tabs.overview': 'نظرة عامة',
      'courseDetails.tabs.curriculum': 'المنهج',
      'courseDetails.tabs.instructor': 'المدرب',
      'courseDetails.overview.whatYoullLearn': 'ما ستعلمه',
      'courseDetails.overview.requirements': 'المتطلبات',
      'courseDetails.overview.description': 'الوصف',
      'courseDetails.curriculum.title': 'المنهج',
      'courseDetails.curriculum.resources': 'مصادر',
      'courseDetails.curriculum.totalLength': 'الطول الإجمالي',
      'courseDetails.curriculum.showLess': 'عرض أقل',
      'courseDetails.curriculum.showMore': 'عرض المزيد',
      'courseDetails.instructor.title': 'المدرب',
      'courseDetails.instructor.students': 'طالب',
      'courseDetails.instructor.rating': 'تقييم',
      'courseDetails.instructor.courses': 'دورات',
      'courseDetails.card.title': 'معلومات الدورة',
      'courseDetails.card.location': 'الموقع',
      'courseDetails.card.start': 'تاريخ البداية',
      'courseDetails.card.end': 'تاريخ النهاية',
      'courseDetails.card.time': 'الوقت',
      'courseDetails.card.seats': 'المقاعد',
      'courseDetails.card.category': 'الفئة',
      'courseDetails.card.onlineRepeated': 'عبر الإنترنت/متكرر',
      'courseDetails.card.kpiWeight': 'الوزن المؤشري',
      'courseDetails.card.notSet': 'غير محدد',
    } as any;

    this.translations.set('en', fallbackEn);
    this.translations.set('ar', fallbackAr);
    this.translationsLoaded$.next(true);
    console.log(
      '[TranslationService] Fallback translations set, loaded state:',
      this.translationsLoaded$.value
    );

    // Test a few translations immediately
    const testKeys = [
      'login.features.title',
      'login.features.subtitle',
      'login.features.courseLibrary.title',
      'login.features.courseLibrary.description',
    ];

    testKeys.forEach((key) => {
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
      return typeof (translations as any)[key] === 'string'
        ? (translations as any)[key]
        : null;
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
