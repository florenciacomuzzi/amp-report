import React, { useCallback, useRef, useEffect } from 'react';
import { TextField } from '@mui/material';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.formatted_address) {
        onChange(place.formatted_address);
        
        if (onPlaceSelected) {
          onPlaceSelected(place);
        }
      }
    }
  }, [onChange, onPlaceSelected]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

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
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
      />
    </Autocomplete>
  );
};

export default AddressAutocomplete;