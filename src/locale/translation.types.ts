export interface TranslationKeys {
  login: {
    title: string;
    subtitle: string;
    form: {
      civilNumber: {
        label: string;
        placeholder: string;
        errors: {
          required: string;
          minlength: string;
          maxlength: string;
        };
      };
      civilNo: {
        label: string;
        placeholder: string;
        errors: {
          required: string;
          minlength: string;
          maxlength: string;
        };
      };
      password: {
        label: string;
        placeholder: string;
        errors: {
          required: string;
          minlength: string;
        };
      };
      rememberMe: string;
      signIn: string;
      loginError: string;
    };
    features: {
      title: string;
      subtitle: string;
      courseLibrary: {
        title: string;
        description: string;
      };
      certifications: {
        title: string;
        description: string;
      };
      collaborativeLearning: {
        title: string;
        description: string;
      };
    };
    footer: {
      copyright: string;
    };
  };
  introduction: {
    header: {
      tagline: string;
      signIn: string;
    };
    hero: {
      title: string;
      subtitle: string;
      startJourney: string;
      learnMore: string;
    };
    features: {
      title: string;
      subtitle: string;
      professionalTraining: {
        title: string;
        description: string;
      };
      diverseLibrary: {
        title: string;
        description: string;
      };
      expertInstructors: {
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      subtitle: string;
      getStarted: string;
      viewCourses: string;
    };
    footer: {
      tagline: string;
      description: string;
      quickLinks: {
        title: string;
        aboutUs: string;
        courses: string;
        instructors: string;
        contact: string;
      };
      support: {
        title: string;
        helpCenter: string;
        privacyPolicy: string;
        termsOfService: string;
        faq: string;
      };
      copyright: string;
    };
    slides: {
      welcome: {
        title: string;
        subtitle: string;
        description: string;
        features: string[];
      };
      mission: {
        title: string;
        subtitle: string;
        description: string;
        features: string[];
      };
      programs: {
        title: string;
        subtitle: string;
        description: string;
        features: string[];
      };
      whyChoose: {
        title: string;
        subtitle: string;
        description: string;
        features: string[];
      };
    };
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
  };
}

export type SupportedLanguage = 'en' | 'ar';

export interface TranslationConfig {
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  fallbackLanguage: SupportedLanguage;
}
