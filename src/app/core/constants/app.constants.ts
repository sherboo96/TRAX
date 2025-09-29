export const APP_CONSTANTS = {
  APP_NAME: 'OTC',
  VERSION: '1.0.0',
  ORGANIZATION: 'trax.com',
  API_BASE_URL: 'http://localhost:5000/api',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    LANGUAGE: 'language',
  },
  ROUTES: {
    HOME: '/',
    INTRODUCTION: '/introduction',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    DASHBOARD: '/dashboard',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_COURSES: '/admin/courses',
    ADMIN_INSTRUCTORS: '/admin/instructors',
    ADMIN_INSTITUTIONS: '/admin/institutions',
    ADMIN_USERS: '/admin/users',
    MODERATOR_DASHBOARD: '/moderator/dashboard',
    MODERATOR_COURSES: '/moderator/courses',
    MODERATOR_INSTRUCTORS: '/moderator/instructors',
    MODERATOR_INSTITUTIONS: '/moderator/institutions',
    PROFILE: '/profile',
    SETTINGS: '/settings',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error occurred.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  SAVE_SUCCESS: 'Data saved successfully.',
  DELETE_SUCCESS: 'Data deleted successfully.',
  UPDATE_SUCCESS: 'Data updated successfully.',
};
