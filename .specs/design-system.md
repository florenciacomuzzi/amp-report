# AMP Report Design System Specification

## Overview
AMP Report uses Material-UI (MUI) v5 as its design foundation, providing a consistent and modern user interface with built-in theming, responsive design, and accessibility features.

## Material-UI Theme Configuration

### Color Palette
The application uses MUI's default theme with customizations:

```typescript
{
  palette: {
    primary: {
      main: '#1976d2',    // Blue
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',    // Red/Pink
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  }
}
```

### Typography System

MUI's typography variants are used throughout:

```typescript
{
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '6rem',
      fontWeight: 300,
      lineHeight: 1.167,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '3.75rem',
      fontWeight: 300,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '3rem',
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '2.125rem',
      fontWeight: 400,
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  }
}
```

### Spacing System

MUI uses an 8px spacing system:

```typescript
spacing: 8, // Default spacing unit

// Usage:
theme.spacing(0)    // 0px
theme.spacing(1)    // 8px
theme.spacing(2)    // 16px
theme.spacing(3)    // 24px
theme.spacing(4)    // 32px
// ... and so on
```

### Breakpoints

Responsive design breakpoints:

```typescript
{
  breakpoints: {
    values: {
      xs: 0,      // Extra small devices
      sm: 600,    // Small devices
      md: 900,    // Medium devices
      lg: 1200,   // Large devices
      xl: 1536,   // Extra large devices
    },
  }
}
```

### Shadows

MUI provides 25 elevation levels (0-24):

```typescript
shadows: [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  // ... up to elevation 24
]
```

## Component Styling Patterns

### 1. Using the sx Prop
The primary method for styling MUI components:

```typescript
<Box
  sx={{
    p: 2,                    // padding: 16px
    m: 1,                    // margin: 8px
    bgcolor: 'background.paper',
    boxShadow: 1,
    borderRadius: 1,
    '&:hover': {
      bgcolor: 'action.hover',
    },
  }}
>
```

### 2. Styled Components
For reusable styled components:

```typescript
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));
```

### 3. Theme Overrides
Global component style overrides:

```typescript
{
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
}
```

## Design Patterns

### Card Design
- Use Paper component with elevation
- Consistent padding using theme.spacing(2)
- Hover effects with elevation change
- CardContent for proper spacing

### Form Design
- TextField with outlined variant
- Consistent margin between fields
- Helper text for validation messages
- Loading states with CircularProgress

### Navigation Design
- AppBar with primary color
- Drawer for mobile navigation
- Breadcrumbs for page hierarchy
- Tab navigation for sections

### Data Display
- DataGrid for tables
- Cards for property listings
- Chips for tags and categories
- Avatars for user profiles

## Responsive Design

### Grid System
```typescript
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Content */}
  </Grid>
</Grid>
```

### Responsive Values
```typescript
<Box
  sx={{
    width: {
      xs: '100%',   // 0-600px
      sm: '50%',    // 600-900px
      md: '33%',    // 900px+
    },
  }}
>
```

## Animation and Transitions

### Standard Transitions
```typescript
{
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  }
}
```

### Common Animations
- Fade transitions for route changes
- Slide transitions for drawers
- Grow transitions for menus
- Zoom transitions for dialogs

## Icons

Material Icons from @mui/icons-material:
- Navigation: Home, Dashboard, Menu, Close
- Actions: Add, Edit, Delete, Save
- Status: Check, Error, Warning, Info
- User: Person, Logout, Settings
- Data: FilterList, Sort, Search

## Accessibility

### ARIA Support
- All MUI components include ARIA attributes
- Keyboard navigation built-in
- Screen reader support

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trapping in modals

### Color Contrast
- Text meets WCAG AA standards
- Important actions use high contrast
- Error states clearly visible

## Best Practices

### 1. Consistency
- Use theme values instead of hard-coded values
- Consistent spacing using theme.spacing()
- Standard elevation levels

### 2. Performance
- Lazy load heavy components
- Use React.memo for expensive renders
- Virtualization for long lists

### 3. Responsiveness
- Mobile-first approach
- Test on multiple screen sizes
- Use responsive typography

### 4. Accessibility
- Semantic HTML elements
- Proper heading hierarchy
- Alternative text for images
- Keyboard navigation support

## Component States

### Interactive States
- Default
- Hover
- Active/Pressed
- Focus
- Disabled

### Loading States
- Skeleton screens
- Progress indicators
- Shimmer effects

### Error States
- Red color for errors
- Clear error messages
- Recovery actions

### Empty States
- Informative messages
- Action suggestions
- Appropriate illustrations