# Sagility Design System

## Color Palette

### Primary Colors (Blue)
- **Primary Dark Blue**: `#1f4fa3` - Logo, main branding
- **Primary Blue**: `#203a7a` - Headings, text
- **Accent Blue**: `#4d7cff` - Links, highlights
- **Sky Blue**: `#39b8ff` - Button left gradient
- **Medium Blue**: `#4d9fe8` - Status, accents
- **Light Blue**: `#4d7cff` - Secondary accents

### Secondary Colors (All Blue Variations)
- **Blue**: `#5a8fd8` - Alternative accent
- **Blue Light**: `#e8f0ff` - Light background
- **Blue Border**: `#a8c6ff` - Blue borders
- **Pale Blue**: `#d4e4ff` - Very light background
- **Pale Blue 2**: `#c7d9f0` - Subtle borders

### Neutral Colors
- **White**: `#ffffff` - Cards, buttons, backgrounds
- **Light Background**: `#f4f8fc` - Page background
- **Hover Background**: `#f8fafd` - Interactive hover
- **Border Light**: `#d8e3f0` - Light borders
- **Border Subtle**: `#cfd9e8` - Input borders
- **Text Dark**: `#123` - Primary text
- **Text Secondary**: `#666` - Secondary text

## Typography

### Font Family
- System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`

### Font Sizes & Weights
- **Logo**: 24px, font-weight: 700
- **Hero Title**: 48px, font-weight: 700
- **Hero Subtitle**: 18px, font-weight: 500
- **Card Headers (h2)**: 20px, font-weight: 600
- **Feature Headers (h3)**: 16px, font-weight: 600
- **Labels**: 14px, font-weight: 500
- **Body Text**: 14px, font-weight: 400
- **Small Text**: 13px, font-weight: 400

## Components

### Header
- Background: White (`#fff`)
- Padding: 18px 40px
- Shadow: `0 2px 10px rgba(0, 0, 0, 0.06)`
- Navigation gap: 30px
- Logo color: Primary Dark Blue

### Hero Section
- Background: Gradient blue (`linear-gradient(135deg, #f0f7ff 0%, #f4f8fc 100%)`)
- Padding: 60px 40px 40px
- Title color: Primary Blue
- Accent span: Accent Blue
- Subtitle color: `#70a0d0`

### Cards
- Background: White
- Border radius: 18px
- Padding: 28px
- Shadow: `0 8px 20px rgba(0, 0, 0, 0.08)`
- Hover shadow: `0 12px 24px rgba(0, 0, 0, 0.1)`

### Buttons
- Gradient: `linear-gradient(90deg, #39b8ff 0%, #8b5cf6 100%)`
- Color: White
- Border radius: 12px
- Padding: 16px 20px
- Font size: 16px
- Font weight: 600
- Hover effect: Transform up 2px, enhanced shadow

### Input Fields
- Border: 2px solid `#cfd9e8`
- Border radius: 10px
- Padding: 14px 16px
- Focus border color: `#4d7cff`
- Focus shadow: `0 0 0 3px rgba(77, 124, 255, 0.1)`

### Labels
- Background: White
- Border: 2px solid `#d8e3f0`
- Border radius: 10px
- Padding: 14px 16px
- Hover border: Accent blue
- Hover background: Light hover

### Package Pills
- Padding: 12px 16px
- Border radius: 10px
- Font weight: 500
- Font size: 14px

#### Green Package
- Background: `#e8fff0`
- Border: 1px solid `#8be0a8`
- Text color: `#2d7a4a`

#### Purple Package
- Background: `#f3ebff`
- Border: 1px solid `#c6a3ff`
- Text color: `#6b3fa0`

### Feature Boxes
- Padding: 20px
- Background: White
- Border radius: 12px
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.05)`
- Display: Flex with gap 16px

#### Feature Icons
- Size: 48px × 48px
- Border radius: 12px
- Colors vary by type (green, blue, purple)

## Spacing & Layout

### Grid Layout
- Main grid: `2fr 1fr` columns
- Gap: 24px
- Max width: 1400px
- Padding: 40px

### Responsive Breakpoints
- **1024px**: Single column grid
- **768px**: Mobile layout, stacked navigation

## Shadows
- Light: `0 2px 10px rgba(0, 0, 0, 0.06)`
- Medium: `0 8px 20px rgba(0, 0, 0, 0.08)`
- Card: `0 4px 12px rgba(0, 0, 0, 0.05)`

## Interactive States

### Hover
- Links: Color change to accent blue, light background
- Buttons: Transform up 2px, enhanced shadow
- Cards: Increased shadow depth
- Labels: Blue border, light background

### Focus
- Inputs/Select: Accent blue border, subtle blue shadow
- Text color maintained for accessibility

### Active
- Buttons: Return to base position
- Checkboxes: Green accent color when checked

## CSS Variables
All colors and values are defined as CSS custom properties in `:root` for easy theming:
- `--primary-dark`
- `--primary-blue`
- `--accent-blue`
- `--sky-blue`
- `--purple`
- `--purple-light`
- `--purple-border`
- `--green`
- `--green-light`
- `--bg-light`
- `--bg-white`
- `--bg-hover`
- `--border-light`
- `--border-subtle`
- `--text-dark`
- `--text-secondary`
- `--shadow-light`
- `--shadow-medium`
- `--shadow-card`
