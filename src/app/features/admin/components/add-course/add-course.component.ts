import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../../locale/translation.pipe';
import { TranslationService } from '../../../../../locale/translation.service';
import { Department } from '../../../../core/models/department.model';
import { Instructor } from '../../../../core/models/instructor.model';
import {
  Location,
  LocationCategory,
} from '../../../../core/models/location.model';
import { User, UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseService } from '../../../../core/services/course.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { InstructorService } from '../../../../core/services/instructor.service';
import { LocationService } from '../../../../core/services/location.service';
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

// Helper function for individual form array controls
function nonEmptyValidator(control: AbstractControl) {
  const value = control.value;
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value.toString().trim() === ''
  ) {
    return { required: true };
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
    TranslatePipe,
  ],
})
export class AddCourseComponent implements OnInit {
  currentUser: User | null = null;
  courseForm: FormGroup;
  loading = false;
  submitting = false;
  loadingInstructors = false;
  loadingDepartments = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // Edit mode properties
  isEditMode = false;
  courseId: number | null = null;
  originalCourse: any = null;

  // Real data from APIs
  instructors: Instructor[] = [];
  departments: Department[] = [];
  locations: Location[] = [];
  loadingLocations = false;

  // Department filter options for target departments (MainType-based)
  departmentFilters = [
    { key: 'all', label: 'الكل', mainTypes: [] as string[] },
    { key: 'upper', label: 'الفئة العليا', mainTypes: ['BM', 'N'] },
    { key: 'middle', label: 'الفئة الوسطي', mainTypes: ['M', 'D'] },
    { key: 'supervisory', label: 'الفئة الاشرافية', mainTypes: ['S'] },
    { key: 'specialized', label: 'الفئة التخصيصة', mainTypes: ['M', 'D', 'S'] },
  ];
  selectedDepartmentFilterKey: string = 'all';

  // Form options - CourseCategory enum values
  categories = [
    { id: 0, name: 'OnSite', icon: '🏢' },
    { id: 1, name: 'OutSite', icon: '🏬' },
    { id: 2, name: 'Online Video', icon: '🎥' },
    { id: 3, name: 'Abroad', icon: '✈️' },
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
    {
      id: 'basic',
      title: 'adminAddCourse.sections.basic',
      icon: '📋',
      completed: false,
    },
    {
      id: 'schedule',
      title: 'adminAddCourse.sections.schedule',
      icon: '📅',
      completed: false,
    },
    {
      id: 'details',
      title: 'adminAddCourse.sections.details',
      icon: '⚙️',
      completed: false,
    },
    {
      id: 'content',
      title: 'adminAddCourse.sections.content',
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
    private router: Router,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private translationService: TranslationService
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      locationId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
      availableSeats: [15, [Validators.required, Validators.min(1)]],
      category: [1, Validators.required],
      onlineRepeated: [true],
      level: [1, Validators.required],
      duration: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      kpiWeight: [0, [Validators.required, Validators.min(0)]],
      requirements: this.fb.array([]),
      learningOutcomes: this.fb.array([]),
      language: ['en', Validators.required],
      certificate: [true],
      targetDepartmentIds: this.fb.array([]),
      instructorIds: this.fb.array([]),
    });
  }

  // Handler to change department filter (to be bound from template select)
  onDepartmentFilterChange(key: string): void {
    this.selectedDepartmentFilterKey = key;
    this.loadDepartments();
  }

  get isRtl(): boolean {
    return this.translationService.isRTL();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.courseId = +params['id'];
        this.loadCourseForEdit();
      } else {
        this.isEditMode = false;
        this.initializeForm();
      }
    });

    this.loadInstructors();
    this.loadDepartments();
    this.setupCategoryLocationCascade();

    // Subscribe to form value changes to ensure data persistence
    this.courseForm.valueChanges.subscribe(() => {
      // Update section completion on any form change
      this.updateSectionCompletion();
    });
  }

  private setupCategoryLocationCascade(): void {
    const categoryControl = this.courseForm.get('category');
    if (categoryControl) {
      // Initial load
      if (categoryControl.value) {
        this.loadLocationsByCategory(categoryControl.value as number);
      }
      categoryControl.valueChanges.subscribe((catId: number) => {
        this.courseForm.patchValue({ locationId: '' }, { emitEvent: false });
        this.loadLocationsByCategory(catId);
      });
    }
  }

  private loadLocationsByCategory(catId: number): void {
    if (!catId) {
      this.locations = [];
      return;
    }
    this.loadingLocations = true;
    this.locationService
      .getByCategory(catId as unknown as LocationCategory)
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.locations = res.result || [];
          } else {
            this.locations = [];
          }
          this.loadingLocations = false;
        },
        error: () => {
          this.locations = [];
          this.loadingLocations = false;
        },
      });
  }

  private initializeForm(): void {
    // Add initial requirement and learning outcome
    this.addRequirement();
    this.addLearningOutcome();

    // Add initial instructor and department
    this.addInstructor();
    this.addDepartment();

    // Don't mark controls as touched initially - let users fill them first
    // The validation will be triggered when they try to submit
  }

  private loadCourseForEdit(): void {
    if (!this.courseId) return;

    this.loading = true;
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.result) {
          this.originalCourse = response.result;
          this.populateFormWithCourseData(response.result);
          this.loading = false;
        } else {
          console.error('Failed to load course for edit:', response.message);
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading course for edit:', error);
        this.loading = false;
      },
    });
  }

  private populateFormWithCourseData(course: any): void {
    // Populate basic form fields
    this.courseForm.patchValue({
      title: course.title || '',
      description: course.description || '',
      locationId: course.locationId || '',
      startDate: course.startDate
        ? new Date(course.startDate).toISOString().split('T')[0]
        : '',
      endDate: course.endDate
        ? new Date(course.endDate).toISOString().split('T')[0]
        : '',
      timeFrom: course.timeFrom || '',
      timeTo: course.timeTo || '',
      availableSeats: course.availableSeats || 1000,
      category: course.category || 1,
      onlineRepeated: course.onlineRepeated || false,
      level: course.level || 1,
      duration: course.duration || '',
      price: course.price || 0,
      kpiWeight: course.kpiWeight || 0,
      // status always defaults to Draft on create
      status: course.statusId || 1,
      language: course.language || 'en',
      certificate: course.certificate || false,
    });

    // Populate form arrays
    this.populateFormArrays(course);

    // Set image preview if course has an image
    if (course.image) {
      this.imagePreview = `${environment.imageBaseUrl}${course.image}`;
    }

    // Update section completion
    this.updateSectionCompletion();
  }

  private populateFormArrays(course: any): void {
    // Clear existing arrays
    this.requirements.clear();
    this.learningOutcomes.clear();
    this.instructorIds.clear();
    this.targetDepartmentIds.clear();

    // Populate requirements
    if (course.requirements && course.requirements.length > 0) {
      course.requirements.forEach((req: string) => {
        this.requirements.push(this.fb.control(req, nonEmptyValidator));
      });
    } else {
      this.addRequirement();
    }

    // Populate learning outcomes
    if (course.learningOutcomes && course.learningOutcomes.length > 0) {
      course.learningOutcomes.forEach((outcome: string) => {
        this.learningOutcomes.push(this.fb.control(outcome, nonEmptyValidator));
      });
    } else {
      this.addLearningOutcome();
    }

    // Populate instructor IDs
    if (course.instructors && course.instructors.length > 0) {
      course.instructors.forEach((instructor: any) => {
        this.instructorIds.push(
          this.fb.control(instructor.id, nonEmptyValidator)
        );
      });
    } else {
      this.addInstructor();
    }

    // Populate target department IDs
    if (course.targetDepartments && course.targetDepartments.length > 0) {
      course.targetDepartments.forEach((dept: any) => {
        this.targetDepartmentIds.push(
          this.fb.control(dept.id, nonEmptyValidator)
        );
      });
    } else {
      this.addDepartment();
    }
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
    const selected = this.departmentFilters.find(
      (f) => f.key === this.selectedDepartmentFilterKey
    );
    const mainTypes = selected ? selected.mainTypes : [];

    this.departmentService
      .getDepartments(1, 1000, {
        order: 'ASC',
        mainTypes: mainTypes,
      })
      .subscribe({
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
    return this.currentUser?.userType === UserRole.ADMIN;
  }

  get isModerator(): boolean {
    return (
      this.currentUser?.userType === UserRole.MODERATOR ||
      this.currentUser?.userType === UserRole.MODERATOR_TYPE_3
    );
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

  // Helper methods to get properly typed form controls
  getRequirementControl(index: number): FormControl {
    return this.requirements.at(index) as FormControl;
  }

  getLearningOutcomeControl(index: number): FormControl {
    return this.learningOutcomes.at(index) as FormControl;
  }

  getInstructorControl(index: number): FormControl {
    return this.instructorIds.at(index) as FormControl;
  }

  getDepartmentControl(index: number): FormControl {
    return this.targetDepartmentIds.at(index) as FormControl;
  }

  // Add/Remove methods for dynamic arrays
  addRequirement(): void {
    this.requirements.push(this.fb.control('', nonEmptyValidator));
    this.updateSectionCompletion();
  }

  removeRequirement(index: number): void {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
      this.updateSectionCompletion();
    }
  }

  addLearningOutcome(): void {
    this.learningOutcomes.push(this.fb.control('', nonEmptyValidator));
    this.updateSectionCompletion();
  }

  removeLearningOutcome(index: number): void {
    if (this.learningOutcomes.length > 1) {
      this.learningOutcomes.removeAt(index);
      this.updateSectionCompletion();
    }
  }

  addInstructor(): void {
    this.instructorIds.push(this.fb.control('', nonEmptyValidator));
    this.updateSectionCompletion();
  }

  removeInstructor(index: number): void {
    if (this.instructorIds.length > 1) {
      this.instructorIds.removeAt(index);
      this.updateSectionCompletion();
    }
  }

  addDepartment(): void {
    this.targetDepartmentIds.push(this.fb.control('', nonEmptyValidator));
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

  private isFormArrayValid(formArray: FormArray): boolean {
    if (formArray.length === 0) return false;
    return formArray.controls.some(
      (control) => control.value && control.value.toString().trim() !== ''
    );
  }

  private isFormValid(): boolean {
    // Check basic form validity
    if (!this.courseForm.valid) return false;

    // Check form arrays have at least one valid entry
    return (
      this.isFormArrayValid(this.requirements) &&
      this.isFormArrayValid(this.learningOutcomes) &&
      this.isFormArrayValid(this.instructorIds) &&
      this.isFormArrayValid(this.targetDepartmentIds)
    );
  }

  private isSectionComplete(sectionId: string): boolean {
    const controls = this.courseForm.controls;

    switch (sectionId) {
      case 'basic':
        return !!(
          controls['title'].valid &&
          controls['description'].valid &&
          controls['locationId'].valid &&
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
          // status removed from form; keep other validations
          controls['price'].valid &&
          controls['kpiWeight'].valid &&
          controls['language'].valid
        );
      case 'content':
        return (
          this.isFormArrayValid(this.requirements) &&
          this.isFormArrayValid(this.learningOutcomes) &&
          this.isFormArrayValid(this.instructorIds) &&
          this.isFormArrayValid(this.targetDepartmentIds)
        );
      default:
        return false;
    }
  }

  // Form submission
  onSubmit(): void {
    // Mark all form controls as touched to show validation errors
    this.markFormGroupTouched();

    // Check if form is valid including custom validation
    if (this.isFormValid()) {
      this.submitting = true;

      const formValue = this.courseForm.value;

      // Prepare the payload
      const coursePayload = {
        title: formValue.title,
        description: formValue.description,
        locationId: parseInt(formValue.locationId),
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
        kpiWeight: formValue.kpiWeight,
        statusId: 1, // default to Draft
        requirements: formValue.requirements.filter(
          (req: string) => req.trim() !== ''
        ),
        learningOutcomes: formValue.learningOutcomes.filter(
          (outcome: string) => outcome.trim() !== ''
        ),
        language: formValue.language,
        certificate: formValue.certificate,
        targetDepartmentIds: formValue.targetDepartmentIds
          .filter((id: any) => id !== null && id !== undefined && id !== '')
          .map((id: any) => parseInt(id)), // Convert to numbers
        instructorIds: formValue.instructorIds
          .filter((id: any) => id !== null && id !== undefined && id !== '')
          .map((id: any) => parseInt(id)), // Convert to numbers
        imageFile: this.selectedImage || undefined, // Add the selected image file
      };

      // Debug: Log the payload to verify image file is included
      console.log('Course payload:', coursePayload);
      console.log('Image file:', this.selectedImage);
      console.log(
        'FormData will be created with image file:',
        !!this.selectedImage
      );

      // Choose between create and update based on mode
      const courseOperation = this.isEditMode
        ? this.courseService.updateCourse(this.courseId!, coursePayload)
        : this.courseService.createCourse(coursePayload);

      courseOperation.subscribe({
        next: (response: any) => {
          console.log(
            `Course ${this.isEditMode ? 'updated' : 'created'} successfully:`,
            response
          );
          this.submitting = false;

          // Show success message
          if (response.statusCode === 200 || response.statusCode === 201) {
            // Navigate back to courses list with success state
            const coursesRoute = this.isAdmin
              ? '/admin/courses'
              : '/moderator/courses';
            this.router.navigate([coursesRoute], {
              queryParams: {
                message: `Course ${
                  this.isEditMode ? 'updated' : 'created'
                } successfully!`,
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
      console.log('Form status:', {
        valid: this.courseForm.valid,
        invalid: this.courseForm.invalid,
        pending: this.courseForm.pending,
        disabled: this.courseForm.disabled,
        touched: this.courseForm.touched,
        dirty: this.courseForm.dirty,
        value: this.courseForm.value,
      });
      console.log('Form array validation:', {
        requirements: this.isFormArrayValid(this.requirements),
        learningOutcomes: this.isFormArrayValid(this.learningOutcomes),
        instructorIds: this.isFormArrayValid(this.instructorIds),
        targetDepartmentIds: this.isFormArrayValid(this.targetDepartmentIds),
      });
    }
  }

  // Helper method to get detailed validation errors
  private getFormValidationErrors(): any {
    const errors: any = {};

    // Check top-level controls
    Object.keys(this.courseForm.controls).forEach((key) => {
      const control = this.courseForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }

      // Check FormArray controls
      if (control instanceof FormArray) {
        const arrayErrors: any = {};
        control.controls.forEach((arrayControl, index) => {
          if (arrayControl.errors) {
            arrayErrors[index] = arrayControl.errors;
          }
        });
        if (Object.keys(arrayErrors).length > 0) {
          errors[key] = arrayErrors;
        }
      }
    });

    // Add custom validation errors
    if (!this.isFormValid()) {
      errors['formValidation'] = {
        requirements: !this.isFormArrayValid(this.requirements)
          ? 'At least one requirement is required'
          : null,
        learningOutcomes: !this.isFormArrayValid(this.learningOutcomes)
          ? 'At least one learning outcome is required'
          : null,
        instructorIds: !this.isFormArrayValid(this.instructorIds)
          ? 'At least one instructor is required'
          : null,
        targetDepartmentIds: !this.isFormArrayValid(this.targetDepartmentIds)
          ? 'At least one department is required'
          : null,
      };
    }

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
    const coursesRoute = this.isAdmin ? '/admin/courses' : '/moderator/courses';
    this.router.navigate([coursesRoute]);
  }

  // Image upload methods
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size should not exceed 5MB');
        return;
      }

      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    // Reset the file input
    const fileInput = document.getElementById(
      'courseImage'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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

  // Build i18n key for categories without relying on a custom pipe
  getCategoryI18nKey(name: string): string {
    if (!name) return '';
    // Normalize common variants to our i18n keys
    const normalized = name
      .replace(/\s+/g, '')
      .replace(/[\W_]/g, '')
      .toLowerCase();
    switch (normalized) {
      case 'onsite':
        return 'onSite';
      case 'outsite':
        return 'outSite';
      case 'onlinevideo':
        return 'onlineVideo';
      case 'abroad':
        return 'abroad';
      default:
        return name; // fallback
    }
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
