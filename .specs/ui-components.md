# UI Components Specification

## Core Components

### 1. Glass Card Component
```typescript
interface GlassCardProps {
  variant?: 'default' | 'subtle' | 'intense' | 'colored';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  blur?: 'sm' | 'md' | 'lg';
  borderGlow?: boolean;
  hoverable?: boolean;
  className?: string;
  children: ReactNode;
}
```

**Styles:**
- Background with transparency and blur
- Subtle border with glow effect
- Hover state with increased border opacity
- Support for dark/light themes

### 2. Button Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: ReactNode;
}
```

**Variants:**
- Primary: Solid background with hover effects
- Secondary: Outlined with transparent background
- Ghost: No border, subtle hover background
- Glass: Glassmorphism effect with backdrop blur

### 3. Input Component
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  glassmorphism?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}
```

**Features:**
- Floating label animation
- Error state with red border
- Optional glassmorphism background
- Icon support

### 4. Select Component
```typescript
interface SelectProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  glassmorphism?: boolean;
  onChange?: (value: string) => void;
}
```

### 5. Modal Component
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  glassmorphism?: boolean;
  closeOnOverlayClick?: boolean;
  children: ReactNode;
}
```

**Features:**
- Backdrop blur effect
- Smooth open/close animations
- Keyboard navigation (ESC to close)
- Focus trap

### 6. Toast/Notification Component
```typescript
interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  glassmorphism?: boolean;
}
```

### 7. Map Container Component
```typescript
interface MapContainerProps {
  center: { lat: number; lng: number };
  zoom?: number;
  satellite?: boolean;
  markers?: Array<{ position: { lat: number; lng: number }; title?: string }>;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  glassmorphism?: boolean;
  className?: string;
}
```

**Features:**
- Google Maps integration
- Satellite/Map view toggle
- Custom marker styling
- Glass overlay for controls

### 8. Chat Interface Component
```typescript
interface ChatInterfaceProps {
  messages: Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  onSendMessage: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
  glassmorphism?: boolean;
}
```

**Features:**
- Message bubbles with glassmorphism
- Typing indicator
- Auto-scroll to latest message
- Markdown support

### 9. Property Form Component
```typescript
interface PropertyFormProps {
  onSubmit: (data: PropertyData) => void;
  initialData?: Partial<PropertyData>;
  loading?: boolean;
}

interface PropertyData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  numberOfUnits: number;
  propertyType: 'apartment' | 'condo' | 'townhouse' | 'single-family';
  yearBuilt?: number;
  features: string[];
  preferences?: string;
}
```

### 10. Amenity Card Component
```typescript
interface AmenityCardProps {
  amenity: {
    name: string;
    category: string;
    estimatedCost: {
      low: number;
      high: number;
    };
    description: string;
    icon?: string;
  };
  selected?: boolean;
  onToggle?: () => void;
  glassmorphism?: boolean;
}
```

### 11. Tenant Profile Display Component
```typescript
interface TenantProfileProps {
  profile: {
    demographics: {
      ageRange: string;
      incomeRange: string;
      lifestyle: string[];
    };
    preferences: {
      amenities: string[];
      location: string[];
      housing: string[];
    };
    score: number;
  };
  glassmorphism?: boolean;
}
```

### 12. Navigation Component
```typescript
interface NavigationProps {
  user?: {
    name: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  glassmorphism?: boolean;
}
```

**Features:**
- Sticky header with blur background
- Dark/Light mode toggle
- User menu dropdown
- Mobile responsive hamburger menu

### 13. Loading States
```typescript
interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  glassmorphism?: boolean;
}
```

### 14. Empty States
```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  glassmorphism?: boolean;
}
```

## Glassmorphism Implementation

### CSS Utilities
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.glass-dark {
  background: rgba(17, 25, 40, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.125);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-intense {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.glass-colored {
  background: rgba(14, 165, 233, 0.15);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(14, 165, 233, 0.3);
}
```

### Animation Classes
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## Theme Context Implementation
```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: typeof colors;
  glassmorphism: typeof glassmorphism;
}
```

## Accessibility Guidelines
1. All interactive elements must have proper ARIA labels
2. Focus states must be clearly visible
3. Color contrast must meet WCAG AA standards
4. Keyboard navigation must be fully supported
5. Screen reader announcements for dynamic content
6. Proper heading hierarchy
7. Form validation messages must be announced
8. Loading states must be announced