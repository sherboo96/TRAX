# Internationalization (i18n) Implementation

This directory contains the internationalization setup for the OTC Frontend application.

## Structure

```
src/locale/
├── en.json                 # English translations
├── ar.json                 # Arabic translations
├── translation.service.ts  # Translation service
├── translation.pipe.ts     # Translation pipe
├── translation.types.ts    # TypeScript types
└── README.md              # This file
```

## Features

### ✅ Multi-language Support

- **English (en)** - Default language
- **Arabic (ar)** - RTL support included

### ✅ Dynamic Language Switching

- Language switcher in the top-right corner of login page
- Language preference saved in localStorage
- Automatic browser language detection

### ✅ RTL (Right-to-Left) Support

- Automatic RTL layout for Arabic
- CSS classes for proper RTL styling
- Icon and text positioning adjustments

### ✅ Type Safety

- TypeScript interfaces for all translation keys
- Compile-time checking of translation keys
- IntelliSense support in IDE

## Usage

### In Templates

```html
<!-- Simple translation -->
{{ 'login.form.civilNumber.label' | translate }}

<!-- Translation with parameters -->
{{ 'login.title' | translate: { appName: 'OTC Platform' } }}
```

### In Components

```typescript
// Inject the service
constructor(private translationService: TranslationService) {}

// Get translated text
const text = this.translationService.translate('login.form.signIn');

// Switch language
this.translationService.setLanguage('ar');

// Check if RTL
const isRTL = this.translationService.isRTL();
```

### Adding New Translations

1. **Add to translation files** (`en.json`, `ar.json`):

```json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}
```

2. **Update TypeScript types** (`translation.types.ts`):

```typescript
export interface TranslationKeys {
  // ... existing keys
  newSection: {
    title: string;
    description: string;
  };
}
```

3. **Use in templates**:

```html
{{ 'newSection.title' | translate }}
```

## Translation Service API

### Methods

- `translate(key: string, params?: Record<string, any>): string`
- `setLanguage(language: SupportedLanguage): void`
- `getCurrentLanguage(): SupportedLanguage`
- `getCurrentLanguage$(): Observable<SupportedLanguage>`
- `isRTL(): boolean`
- `isRTL$(): Observable<boolean>`
- `getSupportedLanguages(): SupportedLanguage[]`

### Supported Languages

- `'en'` - English
- `'ar'` - Arabic

## RTL Support

The implementation includes comprehensive RTL support for Arabic:

- **Document direction**: Automatically set based on language
- **CSS classes**: `.rtl` class applied to root element
- **Layout adjustments**: Flexbox, margins, padding automatically reversed
- **Icon positioning**: Input field icons positioned correctly for RTL
- **Text alignment**: Proper text alignment for RTL languages

## Performance

- **Lazy loading**: Translation files loaded on demand
- **Caching**: Translations cached in memory
- **Bundle splitting**: Each language file is a separate chunk
- **Tree shaking**: Only used translations are included in build

## Browser Support

- Modern browsers with ES6+ support
- localStorage for language persistence
- CSS Grid and Flexbox for RTL layouts

## Future Enhancements

- [ ] Add more languages (French, Spanish, etc.)
- [ ] Pluralization support
- [ ] Date/time formatting per locale
- [ ] Number formatting per locale
- [ ] Translation management system integration
- [ ] Fallback language support for missing translations
