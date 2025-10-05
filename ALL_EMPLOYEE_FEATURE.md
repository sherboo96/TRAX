# All Employee Feature for Add Course Component

## Overview

The "All Employee" feature allows course creators to automatically assign a course to all departments in the organization with a single checkbox selection.

## Implementation Details

### TypeScript Changes Made

1. **Added All Employee State**:

   ```typescript
   allEmployeeSelected: boolean = false;
   ```

2. **Added Event Handler**:

   ```typescript
   onAllEmployeeChange(checked: boolean): void {
     this.allEmployeeSelected = checked;

     if (checked) {
       // Clear existing department selections
       this.targetDepartmentIds.clear();
       // Add all departments to the form array
       this.addAllDepartments();
     } else {
       // Clear all departments and add one empty field
       this.targetDepartmentIds.clear();
       this.addDepartment();
     }

     this.updateSectionCompletion();
   }
   ```

3. **Added Helper Method**:

   ```typescript
   private addAllDepartments(): void {
     this.departments.forEach(dept => {
       this.targetDepartmentIds.push(this.fb.control(dept.id, nonEmptyValidator));
     });
   }
   ```

4. **Updated Form Validation**:

   ```typescript
   private isTargetDepartmentsValid(): boolean {
     if (this.allEmployeeSelected) {
       return this.departments.length > 0; // Valid if we have departments loaded
     }
     return this.isFormArrayValid(this.targetDepartmentIds);
   }
   ```

5. **Updated Form Submission**:
   ```typescript
   targetDepartmentIds: this.allEmployeeSelected
     ? this.departments.map(dept => dept.id) // Use all departments if "All Employee" is selected
     : formValue.targetDepartmentIds
         .filter((id: any) => id !== null && id !== undefined && id !== '')
         .map((id: any) => parseInt(id)), // Convert to numbers
   ```

## HTML Template Usage

Add this checkbox to your template in the target departments section:

```html
<!-- All Employee Option -->
<div class="mb-4">
  <label class="flex items-center space-x-2 cursor-pointer">
    <input type="checkbox" [checked]="allEmployeeSelected" (change)="onAllEmployeeChange($event.target.checked)" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
    <span class="text-sm font-medium text-gray-700"> {{ getAllEmployeeDisplayText() }} </span>
  </label>
</div>

<!-- Department Selection (only show when All Employee is not selected) -->
<div *ngIf="!allEmployeeSelected" class="space-y-4">
  <!-- Your existing department selection UI here -->
  <!-- This will be hidden when All Employee is selected -->
</div>

<!-- Show selected departments when All Employee is selected -->
<div *ngIf="allEmployeeSelected" class="bg-green-50 border border-green-200 rounded-lg p-4">
  <div class="flex items-center space-x-2">
    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
    </svg>
    <span class="text-sm font-medium text-green-800"> Course will be available to all {{ departments.length }} departments </span>
  </div>
</div>
```

## Features

### ✅ **Automatic Department Selection**

- When "All Employee" is checked, all departments are automatically added to the course
- When unchecked, returns to manual department selection

### ✅ **Form Validation**

- Validates that departments are loaded when "All Employee" is selected
- Maintains existing validation for manual department selection

### ✅ **Edit Mode Support**

- Automatically detects if a course has all departments assigned
- Enables "All Employee" option when editing such courses

### ✅ **Visual Feedback**

- Shows count of departments when "All Employee" is selected
- Provides clear indication of what will happen

### ✅ **Form State Management**

- Properly handles form array updates
- Maintains form validation state
- Updates section completion status

## Usage

1. **Creating a New Course**:

   - Check "All Employee" to assign course to all departments
   - Uncheck to manually select specific departments

2. **Editing an Existing Course**:

   - If course is assigned to all departments, "All Employee" will be pre-checked
   - Can toggle between "All Employee" and manual selection

3. **Form Validation**:
   - Form validates correctly whether using "All Employee" or manual selection
   - Shows appropriate error messages

## Benefits

- **Time Saving**: No need to manually select all departments
- **Consistency**: Ensures all employees have access to important courses
- **Flexibility**: Can still use manual selection for specific courses
- **User Friendly**: Clear visual feedback and intuitive interface


