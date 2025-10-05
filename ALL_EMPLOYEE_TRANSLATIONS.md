# All Employee Feature Translation Keys

## Required Translation Keys

Add these keys to your translation files (both English and Arabic):

### English Translation Keys

```json
{
  "adminCourses": {
    "allEmployees": "All Employees",
    "availableForAllEmployees": "Available for all employees"
  }
}
```

### Arabic Translation Keys

```json
{
  "adminCourses": {
    "allEmployees": "جميع الموظفين",
    "availableForAllEmployees": "متاح لجميع الموظفين"
  }
}
```

## Implementation Notes

1. **Visual Indicators**: The frontend now shows:

   - Purple badge with checkmark icon when `isForAllEmployees` is true
   - Text indicator in course description area
   - Tooltip on hover for better UX

2. **Styling**: Uses purple color scheme to distinguish from status badges
3. **Icons**: Uses checkmark icon to indicate "available for all"
4. **Responsive**: Works on all screen sizes

## Features Added

- ✅ **Course List Display**: Shows "All Employees" badge on course cards
- ✅ **Course Details**: Shows availability indicator in description
- ✅ **Visual Distinction**: Purple color scheme for easy identification
- ✅ **Accessibility**: Proper tooltips and ARIA labels
- ✅ **Bilingual Support**: Ready for Arabic translations


