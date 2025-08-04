import React, { useCallback, useRef, useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

// Note: Google Maps Autocomplete shows a deprecation warning as of March 2025.
// This component still works but should be migrated to PlaceAutocompleteElement
// in the future. See: https://developers.google.com/maps/documentation/javascript/places-migration-overview
const libraries: ("places")[] = ['places'];

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelected,
  label = "Street Address",
  required = false,
  error = false,
  helperText = "",
  fullWidth = true,
}) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current && inputRef.current) {
      try {
        const place = autocompleteRef.current.getPlace();
        
        if (place && place.formatted_address) {
          // Update the value through onChange
          onChange(place.formatted_address);
          
          // Force the label to shrink by blurring and focusing
          inputRef.current.blur();
          setFocused(false);
          
          if (onPlaceSelected) {
            onPlaceSelected(place);
          }
        }
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    }
  }, [onChange, onPlaceSelected]);

  if (!isLoaded) {
    return (
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
      />
    );
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        types: ['address'],
        componentRestrictions: { country: 'us' },
      }}
    >
      <TextField
        inputRef={inputRef}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        InputLabelProps={{
          shrink: focused || !!value,
        }}
      />
    </Autocomplete>
  );
};

export default AddressAutocomplete;