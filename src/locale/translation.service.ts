import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  private config: TranslationConfig = {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    fallbackLanguage: 'en',
  };

  constructor() {
    this.loadTranslations();
    this.initializeLanguage();
  }

  private async loadTranslations(): Promise<void> {
    try {
      // Load English translations
      const enTranslations = await import('./en.json');
      this.translations.set('en', enTranslations.default);

      // Load Arabic translations
      const arTranslations = await import('./ar.json');
      this.translations.set('ar', arTranslations.default);
    } catch (error) {
      console.error('Error loading translations:', error);
    }
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
    const translation = this.getTranslationByKey(key, currentLang);

    if (!translation) {
      console.warn(
        `Translation missing for key: ${key} in language: ${currentLang}`
      );
      return key;
    }

    return this.interpolateParams(translation, params);
  }

  private getTranslationByKey(
    key: string,
    language: SupportedLanguage
  ): string | null {
    const translations =
      this.translations.get(language) ||
      this.translations.get(this.config.fallbackLanguage);
    if (!translations) return null;

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
}
