import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CourseService } from '../../../../core/services/course.service';
import { InstructorService } from '../../../../core/services/instructor.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { Instructor } from '../../../../core/models/instructor.model';
import { Department } from '../../../../core/models/department.model';
import { AiHelperComponent } from '../../../../shared/components/ai-helper/ai-helper.component';

// Add this helper function at the top of the class (after imports, before the class definition)
function atLeastOneNonEmptyValidator(control: AbstractControl) {
  if (control instanceof FormArray) {
    const hasNonEmpty = control.controls.some(
      (ctrl) => ctrl.value && ctrl.value.toString().trim() !== ''
    );
    return hasNonEmpty ? null : { atLeastOne: true };
  }
  return null;
}

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AiHelperComponent,
  ],
})
export class AddCourseComponent implements OnInit {
  currentUser: User | null = null;
  courseForm: FormGroup;
  loading = false;
  submitting = false;
  loadingInstructors = false;
  loadingDepartments = false;

  // Real data from APIs
  instructors: Instructor[] = [];
  departments: Department[] = [];

  // Form options
  categories = [
    { id: 1, name: 'Technology', icon: '💻' },
    { id: 2, name: 'Business', icon: '💼' },
    { id: 3, name: 'Design', icon: '🎨' },
    { id: 4, name: 'Marketing', icon: '📈' },
    { id: 5, name: 'Development', icon: '🚀' },
  ];

  levels = [
    { id: 1, name: 'Beginner', color: 'green', icon: '🌱' },
    { id: 2, name: 'Intermediate', color: 'yellow', icon: '📚' },
    { id: 3, name: 'Advanced', color: 'red', icon: '🎯' },
  ];

  statuses = [
    { id: 1, name: 'Draft', color: 'gray', icon: '📝' },
    { id: 2, name: 'Published', color: 'green', icon: '✅' },
    { id: 3, name: 'In Progress', color: 'blue', icon: '🔄' },
    { id: 4, name: 'Completed', color: 'purple', icon: '🏆' },
    { id: 5, name: 'Archived', color: 'red', icon: '📦' },
  ];

  languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  // Form sections for better organization
  formSections = [
    { id: 'basic', title: 'Basic Information', icon: '📋', completed: false },
    {
      id: 'schedule',
      title: 'Schedule & Duration',
      icon: '📅',
      completed: false,
    },
    { id: 'details', title: 'Course Details', icon: '⚙️', completed: false },
    {
      id: 'content',
      title: 'Content & Assignments',
      icon: '📚',
      completed: false,
    },
  ];

  currentSection = 'basic';

  // Store form data to prevent loss during navigation
  private formDataBackup: any = {};

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
      availableSeats: [1000, [Validators.required, Validators.min(1)]],
      category: [1, Validators.required],
      onlineRepeated: [true],
      level: [1, Validators.required],
      duration: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      progress: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      status: [1, Validators.required],
      requirements: this.fb.array([], atLeastOneNonEmptyValidator),
      learningOutcomes: this.fb.array([], atLeastOneNonEmptyValidator),
      language: ['en', Validators.required],
      certificate: [true],
      targetDepartmentIds: this.fb.array([], atLeastOneNonEmptyValidator),
      instructorIds: this.fb.array([], atLeastOneNonEmptyValidator),
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.initializeForm();
    this.loadInstructors();
    this.loadDepartments();

    // Subscribe to form value changes to ensure data persistence
    this.courseForm.valueChanges.subscribe(() => {
      // Update section completion on any form change
      this.updateSectionCompletion();
    });
  }

  private initializeForm(): void {
    // Add initial requirement and learning outcome
    this.addRequirement();
    this.addLearningOutcome();

    // Add initial instructor and department
    this.addInstructor();
    this.addDepartment();

    // Mark the first control in each FormArray as touched to show validation errors if left empty
    setTimeout(() => {
      if (this.requirements.length > 0) {
        this.requirements.at(0).markAsTouched();
      }
      if (this.learningOutcomes.length > 0) {
        this.learningOutcomes.at(0).markAsTouched();
      }
      if (this.instructorIds.length > 0) {
        this.instructorIds.at(0).markAsTouched();
      }
      if (this.targetDepartmentIds.length > 0) {
        this.targetDepartmentIds.at(0).markAsTouched();
      }
    }, 0);
  }

  private loadInstructors(): void {
    this.loadingInstructors = true;
    const paginationRequest = {
      page: 1,
      pageSize: 100,
      order: 'ASC' as const,
      sortBy: 'id',
    };

    this.instructorService.getInstructors(paginationRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.instructors = response.result;
        } else {
          console.error('Failed to load instructors:', response.message);
        }
        this.loadingInstructors = false;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.loadingInstructors = false;
      },
    });
  }

  private loadDepartments(): void {
    this.loadingDepartments = true;
    this.departmentService.getDepartments().subscribe({
      next: (response) => {
        if (response.statusCode == 200) {
          this.departments = response.result;
        } else {
          console.error('Failed to load departments:', response.message);
        }
        this.loadingDepartments = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.loadingDepartments = false;
      },
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.roleId === UserRole.ADMIN;
  }

  // Form array getters
  get requirements() {
    return this.courseForm.get('requirements') as FormArray;
  }

  get learningOutcomes() {
    return this.courseForm.get('learningOutcomes') as FormArray;
  }

  get targetDepartmentIds() {
    return this.courseForm.get('targetDepartmentIds') as FormArray;
  }

  get instructorIds() {
    return this.courseForm.get('instructorIds') as FormArray;
  }

  // Add/Remove methods for dynamic arrays
  addRequirement(): void {
    this.requirements.push(this.fb.control('', Validators.required));
    this.updateSectionCompletion();
  }

  removeRequirement(index: number): void {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
      this.updateSectionCompletion();
    }
  }

  addLearningOutcome(): void {
    this.learningOutcomes.push(this.fb.control('', Validators.required));
    this.updateSectionCompletion();
  }

  removeLearningOutcome(index: number): void {
    if (this.learningOutcomes.length > 1) {
      this.learningOutcomes.removeAt(index);
      this.updateSectionCompletion();
    }
  }

  addInstructor(): void {
    this.instructorIds.push(this.fb.control('', Validators.required));
    this.updateSectionCompletion();
  }

  removeInstructor(index: number): void {
    if (this.instructorIds.length > 1) {
      this.instructorIds.removeAt(index);
      this.updateSectionCompletion();
    }
  }

  addDepartment(): void {
    this.targetDepartmentIds.push(this.fb.control('', Validators.required));
    this.updateSectionCompletion();
  }

  removeDepartment(index: number): void {
    if (this.targetDepartmentIds.length > 1) {
      this.targetDepartmentIds.removeAt(index);
      this.updateSectionCompletion();
    }
  }

  // Section navigation
  goToSection(sectionId: string): void {
    // Preserve form data before navigation
    this.preserveFormData();
    this.currentSection = sectionId;
    this.updateSectionCompletion();
    // Restore form data after navigation
    setTimeout(() => this.restoreFormData(), 0);
  }

  nextSection(): void {
    const currentIndex = this.formSections.findIndex(
      (s) => s.id === this.currentSection
    );
    if (currentIndex < this.formSections.length - 1) {
      // Preserve form data before navigation
      this.preserveFormData();
      this.currentSection = this.formSections[currentIndex + 1].id;
      this.updateSectionCompletion();
    }
  }

  previousSection(): void {
    const currentIndex = this.formSections.findIndex(
      (s) => s.id === this.currentSection
    );
    if (currentIndex > 0) {
      // Preserve form data before navigation
      this.preserveFormData();
      this.currentSection = this.formSections[currentIndex - 1].id;
      this.updateSectionCompletion();
    }
  }

  // Preserve form data to prevent loss during navigation
  private preserveFormData(): void {
    // Store current form values in backup
    this.formDataBackup = { ...this.courseForm.value };

    // Ensure form arrays maintain their values
    if (
      this.formDataBackup.requirements &&
      this.formDataBackup.requirements.length > 0
    ) {
      // Clear and rebuild requirements array with current values
      this.requirements.clear();
      this.formDataBackup.requirements.forEach((req: string) => {
        if (req && req.trim() !== '') {
          this.requirements.push(this.fb.control(req, Validators.required));
        }
      });
      // Ensure at least one requirement exists
      if (this.requirements.length === 0) {
        this.requirements.push(this.fb.control('', Validators.required));
      }
    }

    if (
      this.formDataBackup.learningOutcomes &&
      this.formDataBackup.learningOutcomes.length > 0
    ) {
      // Clear and rebuild learning outcomes array with current values
      this.learningOutcomes.clear();
      this.formDataBackup.learningOutcomes.forEach((outcome: string) => {
        if (outcome && outcome.trim() !== '') {
          this.learningOutcomes.push(
            this.fb.control(outcome, Validators.required)
          );
        }
      });
      // Ensure at least one learning outcome exists
      if (this.learningOutcomes.length === 0) {
        this.learningOutcomes.push(this.fb.control('', Validators.required));
      }
    }

    if (
      this.formDataBackup.instructorIds &&
      this.formDataBackup.instructorIds.length > 0
    ) {
      // Clear and rebuild instructor IDs array with current values
      this.instructorIds.clear();
      this.formDataBackup.instructorIds.forEach((id: any) => {
        if (id !== null && id !== undefined && id !== '') {
          this.instructorIds.push(this.fb.control(id, Validators.required));
        }
      });
      // Ensure at least one instructor exists
      if (this.instructorIds.length === 0) {
        this.instructorIds.push(this.fb.control('', Validators.required));
      }
    }

    if (
      this.formDataBackup.targetDepartmentIds &&
      this.formDataBackup.targetDepartmentIds.length > 0
    ) {
      // Clear and rebuild department IDs array with current values
      this.targetDepartmentIds.clear();
      this.formDataBackup.targetDepartmentIds.forEach((id: any) => {
        if (id !== null && id !== undefined && id !== '') {
          this.targetDepartmentIds.push(
            this.fb.control(id, Validators.required)
          );
        }
      });
      // Ensure at least one department exists
      if (this.targetDepartmentIds.length === 0) {
        this.targetDepartmentIds.push(this.fb.control('', Validators.required));
      }
    }
  }

  // Restore form data after navigation
  private restoreFormData(): void {
    // This method ensures form data is properly displayed after navigation
    // The form data should already be preserved, but we can add additional logic here if needed
    this.updateSectionCompletion();
  }

  private updateSectionCompletion(): void {
    this.formSections.forEach((section) => {
      section.completed = this.isSectionComplete(section.id);
    });
  }

  private isSectionComplete(sectionId: string): boolean {
    const controls = this.courseForm.controls;

    switch (sectionId) {
      case 'basic':
        return !!(
          controls['title'].valid &&
          controls['description'].valid &&
          controls['location'].valid &&
          controls['category'].valid
        );
      case 'schedule':
        return !!(
          controls['startDate'].valid &&
          controls['endDate'].valid &&
          controls['timeFrom'].valid &&
          controls['timeTo'].valid &&
          controls['duration'].valid &&
          controls['availableSeats'].valid
        );
      case 'details':
        return !!(
          controls['level'].valid &&
          controls['status'].valid &&
          controls['price'].valid &&
          controls['progress'].valid &&
          controls['language'].valid
        );
      case 'content':
        return (
          this.requirements.valid &&
          this.learningOutcomes.valid &&
          this.instructorIds.valid &&
          this.targetDepartmentIds.valid
        );
      default:
        return false;
    }
  }

  // Form submission
  onSubmit(): void {
    if (this.courseForm.valid) {
      this.submitting = true;

      const formValue = this.courseForm.value;

      // Prepare the payload
      const coursePayload = {
        title: formValue.title,
        description: formValue.description,
        location: formValue.location,
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: new Date(formValue.endDate).toISOString(),
        timeFrom: formValue.timeFrom,
        timeTo: formValue.timeTo,
        availableSeats: formValue.availableSeats,
        category: formValue.category,
        onlineRepeated: formValue.onlineRepeated,
        level: formValue.level,
        duration: formValue.duration,
        price: formValue.price,
        progress: formValue.progress,
        status: formValue.status,
        requirements: formValue.requirements.filter(
          (req: string) => req.trim() !== ''
        ),
        learningOutcomes: formValue.learningOutcomes.filter(
          (outcome: string) => outcome.trim() !== ''
        ),
        language: formValue.language,
        certificate: formValue.certificate,
        targetDepartmentIds: formValue.targetDepartmentIds.filter(
          (id: any) => id !== null && id !== undefined && id !== ''
        ),
        instructorIds: formValue.instructorIds.filter(
          (id: any) => id !== null && id !== undefined && id !== ''
        ),
      };

      this.courseService.createCourse(coursePayload).subscribe({
        next: (response: any) => {
          console.log('Course created successfully:', response);
          this.submitting = false;

          // Show success message
          if (response.success) {
            // Navigate back to courses list with success state
            this.router.navigate(['/admin/courses'], {
              queryParams: {
                message: 'Course created successfully!',
                type: 'success',
              },
            });
          } else {
            // Handle API error response
            console.error('API returned error:', response.message);
            // You might want to show an error toast here
          }
        },
        error: (error) => {
          console.error('Error creating course:', error);
          this.submitting = false;

          // Handle different types of errors
          let errorMessage = 'Failed to create course. Please try again.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Invalid course data. Please check your inputs.';
          } else if (error.status === 401) {
            errorMessage = 'You are not authorized to create courses.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          // You might want to show an error toast here with errorMessage
          console.error('Error details:', errorMessage);
        },
      });
    } else {
      this.markFormGroupTouched();
      console.log('Form validation errors:', this.getFormValidationErrors());
    }
  }

  // Helper method to get detailed validation errors
  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.courseForm.controls).forEach((key) => {
      const control = this.courseForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Mark all form controls as touched to show validation errors
  private markFormGroupTouched(
    group: FormGroup | FormArray = this.courseForm
  ): void {
    Object.values(group.controls).forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  // Cancel and go back
  onCancel(): void {
    this.router.navigate(['/admin/courses']);
  }

  // Helper methods
  getCategoryName(id: number): string {
    return this.categories.find((cat) => cat.id === id)?.name || '';
  }

  getLevelName(id: number): string {
    return this.levels.find((level) => level.id === id)?.name || '';
  }

  getStatusName(id: number): string {
    return this.statuses.find((status) => status.id === id)?.name || '';
  }

  getInstructorName(id: number): string {
    return (
      this.instructors.find((instructor) => instructor.id === id)?.nameEn || ''
    );
  }

  getDepartmentName(id: number): string {
    return (
      this.departments.find((dept) => dept.id === id)?.nameEn ||
      this.departments.find((dept) => dept.id === id)?.nameAr ||
      ''
    );
  }

  getCurrentStepIndex(): number {
    return this.formSections.findIndex(
      (section) => section.id === this.currentSection
    );
  }

  getLanguageName(code: string): string {
    return this.languages.find((lang) => lang.code === code)?.name || '';
  }

  getLanguageFlag(code: string): string {
    return this.languages.find((lang) => lang.code === code)?.flag || '';
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength'])
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min'])
        return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max'])
        return `${fieldName} cannot exceed ${field.errors['max'].max}`;
    }
    return '';
  }
}
