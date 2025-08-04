import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, ArrowBack, AutoFixHigh, Info } from '@mui/icons-material';
import { trpc } from '../trpc';
import AddressAutocomplete from '../components/AddressAutocomplete';
import PropertyMap from '../components/PropertyMap';

interface PropertyFormData {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  propertyDetails: {
    numberOfUnits: number;
    propertyType: 'apartment' | 'condo' | 'townhouse' | 'other' | '';
    yearBuilt: number;
    targetRentRange: {
      min: number;
      max: number;
    };
    specialFeatures?: string;
  };
}

const steps = ['Basic Information', 'Address', 'Property Details', 'Amenities'];

function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // tRPC hooks
  const utils = trpc.useContext();
  const {
    data: propertyData,
    isLoading: loading,
  } = trpc.property.get.useQuery(id!, { enabled: isEditMode });

  const createPropertyMutation = trpc.property.create.useMutation({
    onSuccess: () => {
      utils.property.list.invalidate();
      navigate('/properties');
    },
  });
  const updatePropertyMutation = trpc.property.update.useMutation({
    onSuccess: () => {
      utils.property.list.invalidate();
      navigate('/properties');
    },
  });
  const geocodeMutation = trpc.property.geocode.useMutation();
  const estimateRentMutation = trpc.property.estimateRent.useMutation();

  const [activeStep, setActiveStep] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [rentEstimate, setRentEstimate] = useState<any>(null);
  const [estimatingRent, setEstimatingRent] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<PropertyFormData>({
    defaultValues: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
      propertyDetails: {
        numberOfUnits: 1,
        propertyType: '',
        yearBuilt: new Date().getFullYear(),
        targetRentRange: {
          min: 0,
          max: 0,
        },
        specialFeatures: '',
      },
    },
  });

  // Populate form in edit mode when data is loaded
  useEffect(() => {
    if (isEditMode && propertyData?.property) {
      const currentProperty = propertyData.property as any;
      setValue('name', currentProperty.name);
      setValue('address', currentProperty.address);
      setValue('propertyDetails', currentProperty.details);
      setAmenities(currentProperty.details.currentAmenities || []);
    }
  }, [isEditMode, propertyData, setValue]);

  const handleGeocode = async () => {
    const address = watch('address');
    if (address.street && address.city && address.state && address.zip) {
      setGeocoding(true);
      try {
        const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
        const result = await geocodeMutation.mutateAsync({ address: fullAddress });
        
        if (result.result) {
          // Update coordinates from geocoding result
          setCoordinates({
            lat: result.result.latitude,
            lng: result.result.longitude,
          });
          
          // Optionally update the formatted address
          if (result.result.formattedAddress) {
            setValue('address.street', result.result.formattedAddress.split(',')[0]);
          }
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
        alert('Failed to verify address. Please check the address and try again.');
      } finally {
        setGeocoding(false);
      }
    } else {
      alert('Please fill in all address fields before verifying.');
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  const handleEstimateRent = async () => {
    const formData = watch();
    console.log('Estimating rent with data:', formData);
    
    if (!formData.address.city || !formData.propertyDetails.propertyType) {
      console.log('Cannot estimate rent - missing required fields:', {
        city: formData.address.city,
        propertyType: formData.propertyDetails.propertyType
      });
      // Silently return - user hasn't selected property type yet
      return;
    }
    
    // Use current year if year built is not provided
    if (!formData.propertyDetails.yearBuilt) {
      formData.propertyDetails.yearBuilt = new Date().getFullYear();
    }

    setEstimatingRent(true);
    try {
      const result = await estimateRentMutation.mutateAsync({
        address: formData.address,
        details: {
          numberOfUnits: formData.propertyDetails.numberOfUnits || 1,
          propertyType: formData.propertyDetails.propertyType,
          yearBuilt: formData.propertyDetails.yearBuilt || new Date().getFullYear(),
          currentAmenities: amenities,
          specialFeatures: formData.propertyDetails.specialFeatures,
          targetRentRange: {
            min: formData.propertyDetails.targetRentRange?.min || 0,
            max: formData.propertyDetails.targetRentRange?.max || 0,
          },
        },
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
      });
      
      console.log('Rent estimation result:', result);
      
      if (result.estimate) {
        setRentEstimate(result.estimate);
        
        const currentMin = Number(watch('propertyDetails.targetRentRange.min')) || 0;
        const currentMax = Number(watch('propertyDetails.targetRentRange.max')) || 0;
        
        // If user has entered a minimum rent, ensure max is reasonable
        if (currentMin > 0 && currentMax === 0) {
          // Set max to be 40-60% higher than min (typical rental range)
          const suggestedMax = Math.round(currentMin * 1.5 / 50) * 50;
          // Ensure max is always greater than min, use the higher of suggested or estimate
          setValue('propertyDetails.targetRentRange.max', Math.max(suggestedMax, result.estimate.max, currentMin + 100));
        } 
        // If user has entered a maximum rent, ensure min is reasonable
        else if (currentMin === 0 && currentMax > 0) {
          // Set min to be 60-70% of max
          const suggestedMin = Math.round(currentMax * 0.65 / 50) * 50;
          setValue('propertyDetails.targetRentRange.min', Math.min(suggestedMin, result.estimate.min));
        }
        // If both are empty, use the estimates
        else if (currentMin === 0 && currentMax === 0) {
          setValue('propertyDetails.targetRentRange.min', result.estimate.min);
          setValue('propertyDetails.targetRentRange.max', result.estimate.max);
        }
        // If both are filled but max < min, fix it
        else if (currentMin > 0 && currentMax > 0 && currentMax < currentMin) {
          setValue('propertyDetails.targetRentRange.max', Math.round(currentMin * 1.5 / 50) * 50);
        }
      }
    } catch (error) {
      console.error('Failed to estimate rent:', error);
    } finally {
      setEstimatingRent(false);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    // Validate required fields
    if (!data.propertyDetails.propertyType || data.propertyDetails.propertyType.length === 0) {
      alert('Please select a property type');
      setActiveStep(2); // Go back to property details step
      return;
    }

    const minRent = Number(data.propertyDetails.targetRentRange.min) || 0;
    const maxRent = Number(data.propertyDetails.targetRentRange.max) || 0;
    
    // Validate rent range
    if (minRent > 0 && maxRent > 0 && minRent >= maxRent) {
      alert('Maximum rent must be greater than minimum rent');
      setActiveStep(2); // Go back to property details step
      return;
    }

    const propertyDataToSave = {
      name: data.name,
      address: data.address,
      details: {
        numberOfUnits: Number(data.propertyDetails.numberOfUnits) || 1,
        propertyType: data.propertyDetails.propertyType as 'apartment' | 'condo' | 'townhouse' | 'other',
        yearBuilt: Number(data.propertyDetails.yearBuilt) || new Date().getFullYear(),
        targetRentRange: {
          min: minRent,
          max: maxRent,
        },
        specialFeatures: data.propertyDetails.specialFeatures || '',
        currentAmenities: amenities,
      },
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
    };

    try {
      if (isEditMode && id) {
        await updatePropertyMutation.mutateAsync({ id, data: propertyDataToSave });
      } else {
        await createPropertyMutation.mutateAsync(propertyDataToSave);
      }
    } catch (error: any) {
      console.error('Failed to save property:', error);
      alert(error.message || 'Failed to save property. Please check all required fields.');
    }
  };

  const handleNext = async () => {
    // Trigger validation for current step
    let fieldsToValidate: any[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ['name'];
        break;
      case 1:
        fieldsToValidate = ['address.street', 'address.city', 'address.state', 'address.zip'];
        break;
      case 2:
        fieldsToValidate = [
          'propertyDetails.numberOfUnits',
          'propertyDetails.propertyType',
          'propertyDetails.yearBuilt',
          'propertyDetails.targetRentRange.min',
          'propertyDetails.targetRentRange.max'
        ];
        break;
    }
    
    const result = await trigger(fieldsToValidate);
    if (result) {
      // Don't auto-estimate rent when moving to step 2 since property type isn't selected yet
      // User can click the Auto-Calculate button after selecting property type
      setActiveStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => setActiveStep((prev) => prev - 1);

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/properties')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'Edit Property' : 'Add New Property'}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
        // Prevent form submission on Enter key except on the last step
        if (e.key === 'Enter' && activeStep !== steps.length - 1) {
          e.preventDefault();
        }
      }}>
        <Card>
          <CardContent>
            {/* Step 0 */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Name"
                    {...register('name', { required: 'Property name is required' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNext();
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 1 */}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AddressAutocomplete
                    value={watch('address.street')}
                    onChange={(value) => setValue('address.street', value)}
                    onPlaceSelected={(place) => {
                      if (place.address_components) {
                        let city = '';
                        let state = '';
                        let zip = '';
                        
                        place.address_components.forEach((component) => {
                          const types = component.types;
                          if (types.includes('locality')) {
                            city = component.long_name;
                          }
                          if (types.includes('administrative_area_level_1')) {
                            state = component.short_name;
                          }
                          if (types.includes('postal_code')) {
                            zip = component.long_name;
                          }
                        });
                        
                        if (city) setValue('address.city', city);
                        if (state) setValue('address.state', state);
                        if (zip) setValue('address.zip', zip);
                      }
                      
                      if (place.geometry?.location) {
                        setCoordinates({
                          lat: place.geometry.location.lat(),
                          lng: place.geometry.location.lng(),
                        });
                      }
                    }}
                    label="Street Address"
                    required
                    error={!!errors.address?.street}
                    helperText={errors.address?.street?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    {...register('address.city', { required: 'City is required' })}
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message}
                    InputLabelProps={{
                      shrink: !!watch('address.city'),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="State"
                    {...register('address.state', { required: 'State is required' })}
                    error={!!errors.address?.state}
                    helperText={errors.address?.state?.message}
                    InputLabelProps={{
                      shrink: !!watch('address.state'),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    {...register('address.zip', { required: 'ZIP code is required' })}
                    error={!!errors.address?.zip}
                    helperText={errors.address?.zip?.message}
                    InputLabelProps={{
                      shrink: !!watch('address.zip'),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={handleGeocode} disabled={geocoding}>
                    {geocoding ? <CircularProgress size={20} /> : 'Verify Address'}
                  </Button>
                </Grid>
                {coordinates && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Property Location Preview
                    </Typography>
                    <PropertyMap
                      latitude={coordinates.lat}
                      longitude={coordinates.lng}
                      address={watch('address.street')}
                      height={300}
                    />
                  </Grid>
                )}
              </Grid>
            )}

            {/* Step 2 */}
            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Units"
                    type="number"
                    {...register('propertyDetails.numberOfUnits', {
                      required: 'Number of units is required',
                      min: { value: 1, message: 'Must have at least 1 unit' },
                    })}
                    error={!!errors.propertyDetails?.numberOfUnits}
                    helperText={errors.propertyDetails?.numberOfUnits?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="propertyDetails.propertyType"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Property type is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Property Type"
                        error={!!errors.propertyDetails?.propertyType}
                        helperText={errors.propertyDetails?.propertyType?.message}
                        value={field.value || ''}
                      >
                        <MenuItem value="">
                          <em>Select a property type</em>
                        </MenuItem>
                        <MenuItem value="apartment">Apartment</MenuItem>
                        <MenuItem value="condo">Condo</MenuItem>
                        <MenuItem value="townhouse">Townhouse</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Year Built"
                    type="number"
                    {...register('propertyDetails.yearBuilt', {
                      required: 'Year built is required',
                      min: { value: 1800, message: 'Invalid year' },
                      max: { value: new Date().getFullYear(), message: 'Invalid year' },
                    })}
                    error={!!errors.propertyDetails?.yearBuilt}
                    helperText={errors.propertyDetails?.yearBuilt?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="subtitle1">Target Rent Range</Typography>
                    <Tooltip 
                      title={
                        !watch('propertyDetails.propertyType')
                          ? "Please select a property type first" 
                          : !watch('address.city') 
                          ? "Please enter a city first"
                          : ""
                      }
                    >
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AutoFixHigh />}
                          onClick={handleEstimateRent}
                          disabled={estimatingRent || !watch('address.city') || !watch('propertyDetails.propertyType')}
                        >
                          {estimatingRent ? 'Estimating...' : 'Auto-Calculate'}
                        </Button>
                      </span>
                    </Tooltip>
                    {rentEstimate && (
                      <Tooltip 
                        title={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Confidence: {Math.round(rentEstimate.confidence * 100)}%
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {rentEstimate.methodology}
                            </Typography>
                            {rentEstimate.factors.map((factor: string, i: number) => (
                              <Typography key={i} variant="body2">• {factor}</Typography>
                            ))}
                          </Box>
                        }
                      >
                        <Info fontSize="small" color="info" />
                      </Tooltip>
                    )}
                  </Box>
                  {rentEstimate && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Suggested rent range: ${rentEstimate.min} - ${rentEstimate.max} per month
                      (Confidence: {Math.round(rentEstimate.confidence * 100)}%)
                    </Alert>
                  )}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Min Rent ($)"
                        type="number"
                        {...register('propertyDetails.targetRentRange.min', {
                          required: 'Minimum rent is required',
                          min: { value: 0, message: 'Must be positive' },
                        })}
                        error={!!errors.propertyDetails?.targetRentRange?.min}
                        helperText={errors.propertyDetails?.targetRentRange?.min?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Max Rent ($)"
                        type="number"
                        {...register('propertyDetails.targetRentRange.max', {
                          required: 'Maximum rent is required',
                          min: { value: 0, message: 'Must be positive' },
                        })}
                        error={!!errors.propertyDetails?.targetRentRange?.max}
                        helperText={errors.propertyDetails?.targetRentRange?.max?.message}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Features (Optional)"
                    multiline
                    rows={3}
                    {...register('propertyDetails.specialFeatures')}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 3 */}
            {activeStep === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Current Amenities
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {amenities.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {amenities.map((amenity) => (
                          <Chip
                            key={amenity}
                            label={amenity}
                            onDelete={() => handleRemoveAmenity(amenity)}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">No amenities added yet</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Add Amenity"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddAmenity}
                      disabled={!newAmenity}
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <>
                    <Button onClick={() => navigate('/properties')} sx={{ mr: 1 }}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={createPropertyMutation.isLoading || updatePropertyMutation.isLoading}>
                      {isEditMode ? 'Update Property' : 'Create Property'}
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" color="primary" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </form>
    </Box>
  );
}

export default PropertyForm;
