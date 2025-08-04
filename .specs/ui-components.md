# UI Components Specification

## Component Library
The application uses Material-UI (MUI) v5 as the primary component library with custom styling and theme configuration.

## Core Components

### 1. Layout Component
**Location:** `client/src/components/Layout.tsx`

**Description:** Main application layout wrapper with navigation and consistent styling.

**Features:**
- AppBar with navigation
- User authentication status display
- Logout functionality
- Responsive drawer for mobile
- Consistent padding and margins

**Props:**
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

### 2. AddressAutocomplete Component
**Location:** `client/src/components/AddressAutocomplete.tsx`

**Description:** Google Places-powered address autocomplete field.

**Features:**
- Integration with Google Places API
- Autocomplete suggestions
- Address parsing into components
- Validation and error handling

**Props:**
```typescript
interface AddressAutocompleteProps {
  onAddressSelect: (address: PlaceResult) => void;
  defaultValue?: string;
  error?: boolean;
  helperText?: string;
}
```

### 3. PropertyMap Component
**Location:** `client/src/components/PropertyMap.tsx`

**Description:** Interactive Google Maps display for property locations.

**Features:**
- Google Maps integration using @react-google-maps/api
- Property marker display
- Satellite/Map view toggle
- Zoom controls
- Responsive sizing

**Props:**
```typescript
interface PropertyMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string | number;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
  }>;
}
```

### 4. TenantProfileChat Component
**Location:** `client/src/components/TenantProfileChat.tsx`

**Description:** AI-powered chat interface for tenant profile generation.

**Features:**
- Real-time chat with AI assistant
- Message history display
- Loading states
- Auto-scroll to latest message
- Input field with send button
- Profile completion detection

**Props:**
```typescript
interface TenantProfileChatProps {
  propertyId: string;
  onProfileComplete?: (profileId: string) => void;
}
```

### 5. PrivateRoute Component
**Location:** `client/src/components/PrivateRoute.tsx`

**Description:** Route wrapper for authentication-protected pages.

**Features:**
- Authentication check
- Redirect to login if not authenticated
- Preserves intended destination
- Loading state while checking auth

**Props:**
```typescript
interface PrivateRouteProps {
  children: React.ReactElement;
}
```

## Page Components

### 1. Login Page
**Location:** `client/src/pages/Login.tsx`

**Features:**
- Email/password form
- Form validation
- Error message display
- Link to registration
- Redux integration for auth state

### 2. Register Page
**Location:** `client/src/pages/Register.tsx`

**Features:**
- Full registration form (email, password, name, company, phone)
- Password strength requirements
- Form validation
- Success/error handling
- Auto-redirect after registration

### 3. Dashboard Page
**Location:** `client/src/pages/Dashboard.tsx`

**Features:**
- Welcome message with user's name
- Quick stats cards
- Recent properties list
- Action buttons for common tasks
- Empty state handling

### 4. Properties Page
**Location:** `client/src/pages/Properties.tsx`

**Features:**
- Property list/grid view
- Property cards with key info
- Create new property button
- Edit/delete actions
- Loading states
- Empty state message

### 5. PropertyDetail Page
**Location:** `client/src/pages/PropertyDetail.tsx`

**Features:**
- Full property information display
- Map view
- Tenant profiles section
- Analyses section
- Edit/delete actions
- Tabbed interface for sections

### 6. PropertyForm Page
**Location:** `client/src/pages/PropertyForm.tsx`

**Features:**
- Multi-step form or single form
- Address autocomplete integration
- Property details input
- Amenities selection
- Form validation
- Save draft functionality
- Success/error handling

### 7. Reports Page
**Location:** `client/src/pages/Reports.tsx`

**Features:**
- Analysis reports list
- Filter by property
- Report cards with summaries
- View detailed report action
- Export functionality (planned)

### 8. AnalysisTRPC Page
**Location:** `client/src/pages/AnalysisTRPC.tsx`

**Features:**
- tRPC integration example
- Property selection
- Tenant profile generation
- Amenity recommendations
- Analysis creation workflow

## Material-UI Theme Configuration
**Location:** `client/src/styles/theme.ts`

**Theme Features:**
- Custom color palette
- Typography configuration
- Component overrides
- Responsive breakpoints
- Custom shadows
- Border radius values

**Color Palette:**
```typescript
{
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#e33371',
    dark: '#9a0036',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  // ... more colors
}
```

## Common MUI Components Used

### 1. Form Components
- **TextField** - Text inputs with various configurations
- **Select/MenuItem** - Dropdown selections
- **Checkbox/Radio** - Selection controls
- **Button** - Action buttons with variants
- **FormControl/FormLabel** - Form structure

### 2. Layout Components
- **Box** - Flexible container
- **Container** - Responsive width container
- **Grid** - 12-column grid system
- **Stack** - Vertical/horizontal layouts
- **Paper** - Elevated surfaces

### 3. Navigation Components
- **AppBar/Toolbar** - Top navigation
- **Drawer** - Side navigation
- **Tabs/Tab** - Tabbed interfaces
- **Breadcrumbs** - Navigation hierarchy

### 4. Data Display Components
- **Card/CardContent** - Content cards
- **Table** - Data tables
- **List/ListItem** - Lists
- **Typography** - Text components
- **Chip** - Small info badges

### 5. Feedback Components
- **CircularProgress/LinearProgress** - Loading indicators
- **Snackbar** - Toast notifications
- **Alert** - Alert messages
- **Dialog** - Modal dialogs
- **Skeleton** - Loading placeholders

## Form Handling
The application uses React Hook Form for form management:

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
```

## State Management Components
- **Redux Toolkit** - Global auth state
- **React Query** - Server state caching
- **Local State** - Component-specific state

## Responsive Design
All components follow Material-UI's responsive patterns:
- Mobile-first approach
- Breakpoint-based styling
- Responsive typography
- Flexible grids and layouts

## Accessibility Features
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Custom Styling Patterns
```typescript
// Using MUI's sx prop
<Box sx={{ 
  p: 2, 
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 1
}}>

// Using styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));
```

## Icon Usage
The application uses Material Icons from @mui/icons-material:
- Home, Dashboard, Add, Edit, Delete
- Person, Logout, Settings
- Map, Place, Business
- Chat, Send, Check
- Error, Warning, Info, Success

## Component Best Practices
1. TypeScript interfaces for all props
2. Memoization for expensive computations
3. Error boundaries for fault tolerance
4. Loading states for async operations
5. Empty states for no data scenarios
6. Consistent spacing using theme.spacing()
7. Responsive design using Grid and breakpoints
8. Accessibility compliance