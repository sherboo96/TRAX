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
  sidebar: {
    digitalLibrary: string;
    dashboard: string;
    adminDashboard: string;
    expandSidebar: string;
    collapseSidebar: string;
    courses: {
      title: string;
      manageCourses: string;
      suggestedCourses: string;
    };
    organization: {
      title: string;
      users: string;
      departments: string;
      organizations: string;
    };
    institutions: {
      title: string;
      instructors: string;
      institutions: string;
    };
    rolesPermissions: {
      title: string;
      roles: string;
    };
    settings: string;
    profile: string;
    logout: string;
    confirmLogout: {
      title: string;
      message: string;
      confirmText: string;
    };
  };
  adminDashboard: {
    title: string;
    welcome: string;
    overview: string;
    subtitle: string;
    stats: {
      totalCourses: string;
      totalInstructors: string;
      totalInstitutions: string;
      totalUsers: string;
      pendingRequests: string;
    };
    upcomingCourses: {
      title: string;
      instructor: string;
      startDate: string;
      enrolledCount: string;
      viewAll: string;
    };
    topCourses: {
      title: string;
      enrolledCount: string;
      percentage: string;
      viewAll: string;
    };
    recentAttendees: {
      title: string;
      name: string;
      course: string;
      completionDate: string;
      status: string;
      completed: string;
      inProgress: string;
      viewAll: string;
    };
    enrollmentRequests: {
      title: string;
      name: string;
      course: string;
      requestDate: string;
      approve: string;
      reject: string;
      viewAll: string;
    };
    actions: {
      viewDetails: string;
      edit: string;
      delete: string;
      approve: string;
      reject: string;
    };
  };
  adminCourses: {
    title: string;
    subtitle: string;
    addCourse: string;
    searchPlaceholder: string;
    filters: {
      title: string;
      category: string;
      level: string;
      status: string;
      clearFilters: string;
    };
    table: {
      title: string;
      category: string;
      level: string;
      status: string;
      progress: string;
      resources: string;
      actions: string;
    };
    actions: {
      view: string;
      edit: string;
      delete: string;
      publish: string;
      unpublish: string;
      makeActive: string;
      complete: string;
      attendanceQR: string;
      generateQR: string;
    };
    status: {
      draft: string;
      published: string;
      inProgress: string;
      completed: string;
      archived: string;
    };
    level: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
    messages: {
      noCourses: string;
      loading: string;
      courseUpdated: string;
      courseDeleted: string;
      coursePublished: string;
      courseUnpublished: string;
      courseActivated: string;
      courseCompleted: string;
    };
    qrPopup: {
      title: string;
      course: string;
      autoReload: string;
      manualReload: string;
      countdown: string;
      seconds: string;
      close: string;
    };
  };
}

export type SupportedLanguage = 'en' | 'ar';

export interface TranslationConfig {
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  fallbackLanguage: SupportedLanguage;
}
