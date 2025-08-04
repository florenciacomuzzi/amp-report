import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

function TestMaps() {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Google Maps API Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        API Key Status: {apiKey ? `Configured (${apiKey.substring(0, 10)}...)` : 'Not configured'}
      </Alert>

      <Typography variant="h6" gutterBottom>
        Required Google APIs:
      </Typography>
      <ul>
        <li>Maps JavaScript API</li>
        <li>Places API</li>
        <li>Static Maps API</li>
        <li>Geocoding API (optional but recommended)</li>
      </ul>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Common Issues:
      </Typography>
      <ol>
        <li>
          <strong>Enable Required APIs:</strong> Go to{' '}
          <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer">
            Google Cloud Console
          </a>{' '}
          and enable the APIs listed above
        </li>
        <li>
          <strong>API Key Restrictions:</strong> If your key has restrictions, add these:
          <ul>
            <li>http://localhost:3001/*</li>
            <li>http://localhost:3000/*</li>
            <li>http://localhost/*</li>
          </ul>
        </li>
        <li>
          <strong>Billing:</strong> Ensure billing is enabled on your Google Cloud project
        </li>
      </ol>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Test Static Map:
      </Typography>
      {apiKey ? (
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x300&key=${apiKey}`}
          alt="Test map"
          style={{ border: '1px solid #ccc' }}
          onError={(e) => {
            console.error('Static map failed to load');
          }}
        />
      ) : (
        <Alert severity="warning">No API key configured</Alert>
      )}
    </Box>
  );
}

export default TestMaps;