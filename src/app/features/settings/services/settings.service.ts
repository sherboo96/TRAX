import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableSSL: boolean;
  testEmail?: string;
}

export interface DatabaseConfig {
  serverName: string;
  databaseName: string;
  username: string;
  password: string;
  connectionString: string;
}

export interface EmailNotifications {
  publishCourse: boolean;
  enrollCourse: boolean;
  courseCompletion: boolean;
  newUserRegistration: boolean;
  passwordReset: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export interface SystemSettings {
  emailConfig: EmailConfig;
  databaseConfig: DatabaseConfig;
  emailNotifications: EmailNotifications;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface SmtpSettingsResponse {
  success: boolean;
  result: {
    'Smtp:Host': string;
    'Smtp:Port': string;
    'Smtp:EnableSsl': string;
    'Smtp:Username': string;
    'Smtp:Password': string;
    'Smtp:FromEmail': string;
    'Smtp:FromName': string;
    'Smtp:TestEmail': string;
  };
}

export interface DatabaseSettingsResponse {
  success: boolean;
  result: {
    'db:Server': string;
    'db:name': string;
    'db:Username': string;
    'db:Password': string;
  };
}

export interface SettingUpdateRequest {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  /**
   * Load SMTP settings from the API
   */
  loadSmtpSettings(): Observable<EmailConfig> {
    return this.http
      .get<SmtpSettingsResponse>(`${this.apiUrl}/group/Smtp`)
      .pipe(
        map((response) => ({
          smtpHost: response.result['Smtp:Host'] || '',
          smtpPort: parseInt(response.result['Smtp:Port']) || 587,
          smtpUsername: response.result['Smtp:Username'] || '',
          smtpPassword: response.result['Smtp:Password'] || '',
          fromEmail: response.result['Smtp:FromEmail'] || '',
          fromName: response.result['Smtp:FromName'] || '',
          enableSSL: response.result['Smtp:EnableSsl'] === 'true',
          testEmail: response.result['Smtp:TestEmail'] || '',
        }))
      );
  }

  /**
   * Load database settings from the API
   */
  loadDatabaseSettings(): Observable<DatabaseConfig> {
    return this.http
      .get<DatabaseSettingsResponse>(`${this.apiUrl}/group/db`)
      .pipe(
        map((response) => ({
          serverName: response.result['db:Server'] || '',
          databaseName: response.result['db:name'] || '',
          username: response.result['db:Username'] || '',
          password: response.result['db:Password'] || '',
          connectionString: this.generateConnectionString({
            serverName: response.result['db:Server'] || '',
            databaseName: response.result['db:name'] || '',
            username: response.result['db:Username'] || '',
            password: response.result['db:Password'] || '',
          }),
        }))
      );
  }

  /**
   * Update a single setting
   */
  updateSetting(key: string, value: string): Observable<any> {
    const payload: SettingUpdateRequest = { key, value };
    return this.http.post(`${this.apiUrl}`, payload);
  }

  /**
   * Test email connection
   */
  testEmailConnection(): Observable<ConnectionTestResult> {
    return this.http.post<ConnectionTestResult>(
      `${this.apiUrl}/test-email`,
      {}
    );
  }

  /**
   * Load system settings from the API (legacy method - keeping for compatibility)
   */
  loadSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(`${this.apiUrl}`);
  }

  /**
   * Save system settings to the API (legacy method - keeping for compatibility)
   */
  saveSettings(settings: SystemSettings): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(`${this.apiUrl}`, settings);
  }

  /**
   * Test database connection with provided configuration
   */
  testDatabaseConnection(
    dbConfig: DatabaseConfig
  ): Observable<ConnectionTestResult> {
    return this.http.post<ConnectionTestResult>(
      `${this.apiUrl}/test-database`,
      dbConfig
    );
  }

  /**
   * Generate connection string from database configuration
   */
  generateConnectionString(dbConfig: Partial<DatabaseConfig>): string {
    if (!dbConfig.serverName || !dbConfig.databaseName) {
      return '';
    }

    const parts = [
      `Server=${dbConfig.serverName}`,
      `Database=${dbConfig.databaseName}`,
    ];

    if (dbConfig.username) {
      parts.push(`User Id=${dbConfig.username}`);
    }

    if (dbConfig.password) {
      parts.push(`Password=*****`);
    }

    parts.push('TrustServerCertificate=true;');

    return parts.join(';');
  }

  /**
   * Get default email configuration
   */
  getDefaultEmailConfig(): EmailConfig {
    return {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      enableSSL: true,
      testEmail: '',
    };
  }

  /**
   * Get default database configuration
   */
  getDefaultDatabaseConfig(): DatabaseConfig {
    return {
      serverName: 'localhost',
      databaseName: 'trainnig',
      username: 'supervisor',
      password: 'p@ssw0rd',
      connectionString:
        'Server=localhost;Database=trainnig;User Id=supervisor;Password=*****;TrustServerCertificate=true;',
    };
  }

  /**
   * Get default email notifications configuration
   */
  getDefaultEmailNotifications(): EmailNotifications {
    return {
      publishCourse: true,
      enrollCourse: true,
      courseCompletion: true,
      newUserRegistration: false,
      passwordReset: true,
      systemAlerts: true,
      weeklyReports: false,
      monthlyReports: false,
    };
  }

  /**
   * Get default system settings
   */
  getDefaultSettings(): SystemSettings {
    return {
      emailConfig: this.getDefaultEmailConfig(),
      databaseConfig: this.getDefaultDatabaseConfig(),
      emailNotifications: this.getDefaultEmailNotifications(),
    };
  }

  /**
   * Sync departments from external system
   */
  syncDepartments(): Observable<ConnectionTestResult> {
    return this.http.post<ConnectionTestResult>(
      `${this.apiUrl}/syncDepartments`,
      {}
    );
  }

  /**
   * Sync users from external system
   */
  syncUsers(): Observable<ConnectionTestResult> {
    return this.http.post<ConnectionTestResult>(`${this.apiUrl}/syncUsers`, {});
  }
}
