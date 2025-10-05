# Translation Keys for All Employee Feature

## Required Translation Keys

Add these keys to your translation files (both English and Arabic):

### English Translation Keys

```json
{
  "adminAddCourse": {
    "content": {
      "departments": {
        "allEmployeesSelected": "All Employees Selected",
        "allEmployeesDescription": "Course will be available to all employees in all departments",
        "departments": "departments"
      }
    }
  }
}
```

### Arabic Translation Keys

```json
{
  "adminAddCourse": {
    "content": {
      "departments": {
        "allEmployeesSelected": "تم تحديد جميع الموظفين",
        "allEmployeesDescription": "ستكون الدورة متاحة لجميع الموظفين في جميع الأقسام",
        "departments": "أقسام"
      }
    }
  }
}
```

## Implementation Notes

1. **Dynamic Text**: The component uses `getAllEmployeeDisplayText()` method to show dynamic text based on selection state
2. **Arabic Support**: The HTML includes Arabic text directly for better UX
3. **Conditional Display**: All department selection UI is hidden when "All Employee" is selected
4. **Visual Feedback**: Green status box shows when all employees are selected

## Features

- ✅ **Bilingual Support**: English and Arabic text
- ✅ **Dynamic Display**: Shows department count when selected
- ✅ **Visual Feedback**: Clear indication of selection state
- ✅ **Conditional UI**: Hides manual selection when "All Employee" is active
- ✅ **Accessibility**: Proper labels and ARIA attributes


