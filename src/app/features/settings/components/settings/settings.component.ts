import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  SettingsService,
  SystemSettings,
  EmailConfig,
  DatabaseConfig,
  EmailNotifications,
} from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  activeTab = 'email';
  loading = false;
  testing = false;
  saving = false;
  savingIndividual = false;
  syncingDepartments = false;
  syncingUsers = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private settingsService: SettingsService
  ) {
    this.settingsForm = this.fb.group({
      emailConfig: this.fb.group({
        smtpHost: ['', Validators.required],
        smtpPort: [
          587,
          [Validators.required, Validators.min(1), Validators.max(65535)],
        ],
        smtpUsername: ['', Validators.required],
        smtpPassword: ['', Validators.required],
        fromEmail: ['', [Validators.required, Validators.email]],
        fromName: ['', Validators.required],
        enableSSL: [true],
        testEmail: ['', [Validators.required, Validators.email]],
      }),
      databaseConfig: this.fb.group({
        serverName: ['', Validators.required],
        databaseName: ['', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required],
        connectionString: ['', Validators.required],
      }),
      emailNotifications: this.fb.group({
        publishCourse: [true],
        enrollCourse: [true],
        courseCompletion: [true],
        newUserRegistration: [false],
        passwordReset: [true],
        systemAlerts: [true],
        weeklyReports: [false],
        monthlyReports: [false],
      }),
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;

    // Load SMTP settings from the new endpoint
    this.settingsService.loadSmtpSettings().subscribe({
      next: (emailConfig) => {
        this.settingsForm.get('emailConfig')?.patchValue(emailConfig);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading SMTP settings:', error);
        // Load default settings if API fails
        const defaultEmailConfig = this.settingsService.getDefaultEmailConfig();
        this.settingsForm.get('emailConfig')?.patchValue(defaultEmailConfig);
        this.loading = false;
        this.toastr.warning(
          'Using default SMTP settings. Could not load from server.'
        );
      },
    });

    // Load database settings from the new endpoint
    this.settingsService.loadDatabaseSettings().subscribe({
      next: (databaseConfig) => {
        this.settingsForm.get('databaseConfig')?.patchValue(databaseConfig);
      },
      error: (error) => {
        console.error('Error loading database settings:', error);
        // Load default settings if API fails
        const defaultDatabaseConfig =
          this.settingsService.getDefaultDatabaseConfig();
        this.settingsForm
          .get('databaseConfig')
          ?.patchValue(defaultDatabaseConfig);
        this.toastr.warning(
          'Using default database settings. Could not load from server.'
        );
      },
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.saving = true;
      const settings = this.settingsForm.value;

      this.settingsService.saveSettings(settings).subscribe({
        next: (savedSettings) => {
          this.saving = false;
          this.toastr.success('Settings saved successfully!');
        },
        error: (error) => {
          console.error('Error saving settings:', error);
          this.saving = false;
          this.toastr.error('Failed to save settings. Please try again.');
        },
      });
    } else {
      this.markFormGroupTouched();
      this.toastr.error('Please fill in all required fields correctly.');
    }
  }

  saveEmailSetting(key: string, value: string): void {
    this.savingIndividual = true;
    this.settingsService.updateSetting(key, value).subscribe({
      next: () => {
        this.savingIndividual = false;
        this.toastr.success(`${key} updated successfully!`);
        // Reload only the specific setting that was updated
        this.reloadSpecificSetting(key);
      },
      error: (error) => {
        console.error(`Error updating ${key}:`, error);
        this.savingIndividual = false;
        this.toastr.error(`Failed to update ${key}. Please try again.`);
      },
    });
  }

  private reloadSpecificSetting(key: string): void {
    // Reload only the specific setting based on the key
    if (key.startsWith('Smtp:')) {
      this.settingsService.loadSmtpSettings().subscribe({
        next: (emailConfig) => {
          this.settingsForm.get('emailConfig')?.patchValue(emailConfig);
        },
        error: (error) => {
          console.error('Error reloading SMTP settings:', error);
        },
      });
    } else if (key.startsWith('db:')) {
      this.settingsService.loadDatabaseSettings().subscribe({
        next: (databaseConfig) => {
          this.settingsForm.get('databaseConfig')?.patchValue(databaseConfig);
        },
        error: (error) => {
          console.error('Error reloading database settings:', error);
        },
      });
    }
  }

  saveSmtpHost(): void {
    const host = this.settingsForm.get('emailConfig.smtpHost')?.value;
    if (host) {
      this.saveEmailSetting('Smtp:Host', host);
    }
  }

  saveSmtpPort(): void {
    const port = this.settingsForm.get('emailConfig.smtpPort')?.value;
    if (port) {
      this.saveEmailSetting('Smtp:Port', port.toString());
    }
  }

  saveSmtpUsername(): void {
    const username = this.settingsForm.get('emailConfig.smtpUsername')?.value;
    if (username) {
      this.saveEmailSetting('Smtp:Username', username);
    }
  }

  saveSmtpPassword(): void {
    const password = this.settingsForm.get('emailConfig.smtpPassword')?.value;
    if (password) {
      this.saveEmailSetting('Smtp:Password', password);
    }
  }

  saveFromEmail(): void {
    const fromEmail = this.settingsForm.get('emailConfig.fromEmail')?.value;
    if (fromEmail) {
      this.saveEmailSetting('Smtp:FromEmail', fromEmail);
    }
  }

  saveFromName(): void {
    const fromName = this.settingsForm.get('emailConfig.fromName')?.value;
    if (fromName) {
      this.saveEmailSetting('Smtp:FromName', fromName);
    }
  }

  saveEnableSsl(): void {
    const enableSSL = this.settingsForm.get('emailConfig.enableSSL')?.value;
    this.saveEmailSetting('Smtp:EnableSsl', enableSSL.toString());
  }

  saveTestEmail(): void {
    const testEmail = this.settingsForm.get('emailConfig.testEmail')?.value;
    if (testEmail) {
      this.saveEmailSetting('Smtp:TestEmail', testEmail);
    }
  }

  // Database settings save methods
  saveDatabaseServer(): void {
    const server = this.settingsForm.get('databaseConfig.serverName')?.value;
    if (server) {
      this.saveEmailSetting('db:Server', server);
    }
  }

  saveDatabaseName(): void {
    const dbName = this.settingsForm.get('databaseConfig.databaseName')?.value;
    if (dbName) {
      this.saveEmailSetting('db:name', dbName);
    }
  }

  saveDatabaseUsername(): void {
    const username = this.settingsForm.get('databaseConfig.username')?.value;
    if (username) {
      this.saveEmailSetting('db:Username', username);
    }
  }

  saveDatabasePassword(): void {
    const password = this.settingsForm.get('databaseConfig.password')?.value;
    if (password) {
      this.saveEmailSetting('db:Password', password);
    }
  }

  testEmailConnection(): void {
    this.testing = true;
    this.settingsService.testEmailConnection().subscribe({
      next: (result) => {
        this.testing = false;
        if (result.success) {
          this.toastr.success('Email connection test successful!');
        } else {
          this.toastr.error(`Email connection test failed: ${result.message}`);
        }
      },
      error: (error) => {
        console.error('Error testing email connection:', error);
        this.testing = false;
        this.toastr.error('Failed to test email connection. Please try again.');
      },
    });
  }

  testDatabaseConnection(): void {
    const dbConfig = this.settingsForm.get('databaseConfig')?.value;
    if (dbConfig) {
      this.loading = true;
      this.settingsService.testDatabaseConnection(dbConfig).subscribe({
        next: (result) => {
          this.loading = false;
          if (result.success) {
            this.toastr.success('Database connection test successful!');
          } else {
            this.toastr.error(
              `Database connection test failed: ${result.message}`
            );
          }
        },
        error: (error) => {
          console.error('Error testing database connection:', error);
          this.loading = false;
          this.toastr.error(
            'Failed to test database connection. Please try again.'
          );
        },
      });
    }
  }

  generateConnectionString(): void {
    const dbConfig = this.settingsForm.get('databaseConfig')?.value;
    if (dbConfig.serverName && dbConfig.databaseName) {
      const connectionString =
        this.settingsService.generateConnectionString(dbConfig);
      this.settingsForm
        .get('databaseConfig.connectionString')
        ?.setValue(connectionString);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.settingsForm.controls).forEach((key) => {
      const control = this.settingsForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach((subKey) => {
          control.get(subKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  get emailConfigForm(): FormGroup {
    return this.settingsForm.get('emailConfig') as FormGroup;
  }

  get databaseConfigForm(): FormGroup {
    return this.settingsForm.get('databaseConfig') as FormGroup;
  }

  get emailNotificationsForm(): FormGroup {
    return this.settingsForm.get('emailNotifications') as FormGroup;
  }

  syncDepartments(): void {
    this.syncingDepartments = true;
    this.settingsService.syncDepartments().subscribe({
      next: (result) => {
        this.syncingDepartments = false;
        if (result.success) {
          this.toastr.success('Departments synchronized successfully!');
        } else {
          this.toastr.error(`Failed to sync departments: ${result.message}`);
        }
      },
      error: (error) => {
        console.error('Error syncing departments:', error);
        this.syncingDepartments = false;
        this.toastr.error('Failed to sync departments. Please try again.');
      },
    });
  }

  syncUsers(): void {
    this.syncingUsers = true;
    this.settingsService.syncUsers().subscribe({
      next: (result) => {
        this.syncingUsers = false;
        if (result.success) {
          this.toastr.success('Users synchronized successfully!');
        } else {
          this.toastr.error(`Failed to sync users: ${result.message}`);
        }
      },
      error: (error) => {
        console.error('Error syncing users:', error);
        this.syncingUsers = false;
        this.toastr.error('Failed to sync users. Please try again.');
      },
    });
  }
}
