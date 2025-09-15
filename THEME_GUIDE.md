# OTC Frontend Theme Guide

## Color Palette

### Primary Colors (Dark Navy Blue - #14255B)

- **Primary 50**: `#e8ebf5` - Lightest shade for backgrounds
- **Primary 100**: `#d1d7eb` - Light backgrounds
- **Primary 200**: `#a3afd7` - Borders and dividers
- **Primary 300**: `#7587c3` - Disabled states
- **Primary 400**: `#475faf` - Secondary text
- **Primary 500**: `#14255B` - **Main Primary Color** - Buttons, links, active states
- **Primary 600**: `#122359` - Deeper Navy Variation - Hover states
- **Primary 700**: `#0B1C54` - Deeper Navy Variation - Darker hover states
- **Primary 800**: `#081540` - Dark text
- **Primary 900**: `#050e2c` - Darkest shade

### Secondary Colors (Lime Green - #B0D400)

- **Secondary 50**: `#f7fce8` - Lightest shade for backgrounds
- **Secondary 100**: `#eff9d1` - Light backgrounds
- **Secondary 200**: `#dff3a3` - Borders and dividers
- **Secondary 300**: `#cfed75` - Disabled states
- **Secondary 400**: `#bfe747` - Secondary text
- **Secondary 500**: `#B0D400` - **Main Secondary Color** - Accent elements, highlights
- **Secondary 600**: `#8daa00` - Hover states
- **Secondary 700**: `#6a8000` - Darker hover states
- **Secondary 800**: `#475600` - Dark text
- **Secondary 900**: `#242c00` - Darkest shade

### Accent Colors (Blue - #0ea5e9)

- **Accent 50**: `#f0f9ff` - Lightest shade
- **Accent 500**: `#0ea5e9` - Main accent color
- **Accent 900**: `#0c4a6e` - Darkest shade

## Usage Guidelines

### Primary Color Usage

- **Primary 500** (`#14255B`): Main buttons, active navigation items, primary CTAs
- **Primary 600** (`#122359`): Hover states for primary elements
- **Primary 700** (`#0B1C54`): Darker hover states and accents
- **Primary 100** (`#d1d7eb`): Light backgrounds for primary-themed sections
- **Primary 200** (`#a3afd7`): Borders and dividers in primary sections

### Secondary Color Usage

- **Secondary 500** (`#B0D400`): Accent buttons, highlights, success states
- **Secondary 600** (`#8daa00`): Hover states for secondary elements
- **Secondary 100** (`#eff9d1`): Light backgrounds for secondary-themed sections
- **Secondary 200** (`#dff3a3`): Borders and dividers in secondary sections

### Gradient Usage

- **bg-gradient-primary**: `linear-gradient(135deg, #145152 0%, #0c3132 100%)`
- **bg-gradient-secondary**: `linear-gradient(135deg, #B0D400 0%, #8daa00 100%)`
- **bg-gradient-primary-secondary**: `linear-gradient(135deg, #145152 0%, #B0D400 100%)`
- **bg-gradient-secondary-primary**: `linear-gradient(135deg, #B0D400 0%, #145152 100%)`

## Pre-built Component Classes

### Buttons

```html
<!-- Primary Button -->
<button class="btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="btn-secondary">Secondary Action</button>

<!-- Outline Primary Button -->
<button class="btn-outline-primary">Outline Primary</button>

<!-- Outline Secondary Button -->
<button class="btn-outline-secondary">Outline Secondary</button>
```

### Cards

```html
<!-- Primary Card -->
<div class="card-primary p-6">
  <h3>Primary Card</h3>
  <p>Content here</p>
</div>

<!-- Secondary Card -->
<div class="card-secondary p-6">
  <h3>Secondary Card</h3>
  <p>Content here</p>
</div>
```

### Inputs

```html
<!-- Primary Input -->
<input class="input-primary w-full p-3 rounded-lg" placeholder="Primary input" />

<!-- Secondary Input -->
<input class="input-secondary w-full p-3 rounded-lg" placeholder="Secondary input" />
```

### Text Gradients

```html
<!-- Primary Text Gradient -->
<h1 class="text-gradient-primary">Primary Gradient Text</h1>

<!-- Secondary Text Gradient -->
<h1 class="text-gradient-secondary">Secondary Gradient Text</h1>

<!-- Primary to Secondary Gradient -->
<h1 class="text-gradient-primary-secondary">Primary to Secondary Gradient</h1>
```

## Tailwind Classes

### Background Colors

- `bg-primary-50` to `bg-primary-900`
- `bg-secondary-50` to `bg-secondary-900`
- `bg-accent-50` to `bg-accent-900`

### Text Colors

- `text-primary-50` to `text-primary-900`
- `text-secondary-50` to `text-secondary-900`
- `text-accent-50` to `text-accent-900`

### Border Colors

- `border-primary-50` to `border-primary-900`
- `border-secondary-50` to `border-secondary-900`
- `border-accent-50` to `border-accent-900`

### Shadow Classes

- `shadow-primary` - Primary color shadow
- `shadow-secondary` - Secondary color shadow
- `shadow-primary-lg` - Large primary shadow
- `shadow-secondary-lg` - Large secondary shadow

## Implementation Examples

### Login Page

```html
<!-- Main container with gradient background -->
<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
  <!-- Login form with primary theming -->
  <div class="bg-white rounded-xl shadow-primary-lg">
    <h2 class="text-gradient-primary">Welcome to OTC</h2>
    <button class="btn-primary w-full">Sign In</button>
  </div>
</div>
```

### Navigation

```html
<!-- Header with primary branding -->
<header class="bg-white shadow-primary">
  <h1 class="text-gradient-primary">OTC</h1>
  <nav class="text-primary-600">
    <a class="hover:text-primary-700">Dashboard</a>
  </nav>
</header>

<!-- Sidebar with primary gradient -->
<aside class="bg-gradient-primary text-white">
  <a class="hover:bg-white/10">Navigation Item</a>
</aside>
```

### Cards and Content

```html
<!-- Feature card with secondary accent -->
<div class="card-primary p-6">
  <div class="w-12 h-12 bg-secondary-500 rounded-lg flex items-center justify-center">
    <svg class="w-6 h-6 text-white">...</svg>
  </div>
  <h3 class="text-primary-700">Feature Title</h3>
  <p class="text-neutral-600">Feature description</p>
</div>
```

## Best Practices

1. **Consistency**: Use primary colors for main actions and navigation
2. **Contrast**: Ensure sufficient contrast between text and background colors
3. **Accessibility**: Test color combinations for accessibility compliance
4. **Hierarchy**: Use color intensity to create visual hierarchy
5. **Branding**: Maintain consistent use of primary and secondary colors across the application

## Color Combinations

### Recommended Combinations

- **Primary + White**: High contrast, professional look
- **Primary + Secondary**: Complementary, vibrant look
- **Primary + Neutral**: Subtle, clean look
- **Secondary + White**: Fresh, energetic look

### Avoid These Combinations

- Primary 500 + Secondary 500 (low contrast)
- Primary 900 + Secondary 900 (both too dark)
- Primary 50 + Secondary 50 (both too light)

## CSS Variables

The theme also includes CSS variables for easy customization:

```css
:root {
  --color-primary: #145152;
  --color-primary-light: #338787;
  --color-primary-dark: #0c3132;
  --color-secondary: #b0d400;
  --color-secondary-light: #bfe747;
  --color-secondary-dark: #8daa00;
  --color-accent: #0ea5e9;
}
```

These can be used in custom CSS when Tailwind classes aren't sufficient.
