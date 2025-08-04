import React from 'react';
import { Box, Typography } from '@mui/material';

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  width?: string | number;
  height?: string | number;
  zoom?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  address,
  width = '100%',
  height = 400,
  zoom = 18,
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography color="text.secondary">
          Google Maps API key not configured
        </Typography>
      </Box>
    );
  }

  if (!latitude || !longitude) {
    return (
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography color="text.secondary">
          Location coordinates not available
        </Typography>
      </Box>
    );
  }

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=640x400&maptype=satellite&markers=color:red|${latitude},${longitude}&key=${apiKey}`;

  return (
    <Box sx={{ width, height, overflow: 'hidden', borderRadius: 2 }}>
      <img
        src={mapUrl}
        alt={address || 'Property location'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 8,
        }}
      />
    </Box>
  );
};

export default PropertyMap;