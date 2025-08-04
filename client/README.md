# AMP Report Frontend

This is the React frontend for the AMP Report application.

## Features

- **Authentication**: Secure login and registration
- **Property Management**: Create, edit, view, and delete properties
- **AI Analysis**: Generate tenant profiles and amenity recommendations
- **Reports**: View and export analysis reports
- **Google Maps Integration**: Visualize property locations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 18 with TypeScript
- Redux Toolkit for state management
- Material-UI for components and styling
- React Router for navigation
- React Hook Form for form handling
- Axios for API calls

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your Google Maps API key to `.env`:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3000

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── services/       # API services
├── store/          # Redux store and slices
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── styles/         # Global styles and theme
```

## API Integration

The frontend connects to the backend API running on port 3000. In development, requests are proxied through the React development server.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.