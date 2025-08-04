import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment,
  LocationOn,
  Home,
  AttachMoney,
  CalendarToday,
  ArrowBack,
  Chat as ChatIcon,
} from '@mui/icons-material';
import TenantProfileChat from '../components/TenantProfileChat';
import PropertyMap from '../components/PropertyMap';
import { trpc } from '../trpc';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to get color based on confidence score
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#4caf50'; // Green for high confidence
  if (confidence >= 0.6) return '#ff9800'; // Orange for medium confidence
  return '#f44336'; // Red for low confidence
}

function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch property with tRPC
  const {
    data,
    isLoading: loading,
    refetch,
  } = trpc.property.get.useQuery(id!, { enabled: !!id });
  const currentProperty = data?.property as any;

  // Delete mutation
  const utils = trpc.useContext();
  const deletePropertyMutation = trpc.property.remove.useMutation({
    onSuccess: () => {
      utils.property.list.invalidate();
      navigate('/properties');
    },
  });

  const deleteTenantProfileMutation = trpc.tenantProfile.remove.useMutation({
    onSuccess: () => {
      utils.tenantProfile.getByProperty.invalidate(id);
      setTenantProfile(null);
      setDeleteDialogOpen(false);
    },
  });

  const [tabValue, setTabValue] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch tenant profile using TRPC query hook
  const { data: tenantProfileData, error: tenantProfileError } = trpc.tenantProfile.getByProperty.useQuery(id!, {
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (tenantProfileData?.tenantProfile) {
      setTenantProfile(tenantProfileData.tenantProfile);
    }
  }, [tenantProfileData]);

  // Don't log errors for missing tenant profiles - it's normal
  useEffect(() => {
    if (tenantProfileError && !tenantProfileError.message?.includes('not found')) {
      console.error('Error fetching tenant profile:', tenantProfileError);
    }
  }, [tenantProfileError]);

  // Create tenant profile mutation
  const createTenantProfileMutation = trpc.tenantProfile.create.useMutation({
    onSuccess: (data: any) => {
      setTenantProfile(data.tenantProfile);
      setChatOpen(false);
      utils.tenantProfile.getByProperty.invalidate(id!);
    },
    onError: (error: any) => {
      console.error('Error creating tenant profile:', error);
    },
  });

  const handleTenantProfileComplete = async (profileData: any) => {
    await createTenantProfileMutation.mutateAsync({
      propertyId: id!,
      ...profileData,
      generationMethod: 'chat',
    });
  };

  const handleDelete = async () => {
    if (currentProperty && window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deletePropertyMutation.mutateAsync(String(currentProperty.id));
      } catch (error: any) {
        console.error('Failed to delete property:', error);
        alert(error.message || 'Failed to delete property. You may not have permission to delete this property.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentProperty) {
    return (
      <Box>
        <Typography variant="h5">Property not found</Typography>
        <Button onClick={() => navigate('/properties')} sx={{ mt: 2 }}>
          Back to Properties
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/properties')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {currentProperty.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/properties/${currentProperty.id}/edit`)}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Assessment />}
          onClick={() => navigate(`/properties/${currentProperty.id}/analysis`)}
          sx={{ mr: 1 }}
        >
          Run Analysis
        </Button>
        <IconButton color="error" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="Overview" />
                  <Tab label="Details" />
                  <Tab label="Amenities" />
                  <Tab label="Location" />
                  <Tab label="Tenant Profile" />
                </Tabs>
              </Box>

              {/* Overview */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <LocationOn sx={{ mr: 1 }} />
                        <Box>
                          <Typography>{currentProperty.address.street}</Typography>
                          <Typography>
                            {currentProperty.address.city}, {currentProperty.address.state}{' '}
                            {currentProperty.address.zip}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Property Type
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Home sx={{ mr: 1 }} />
                        <Typography>{currentProperty.details.propertyType}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Number of Units
                      </Typography>
                      <Typography variant="h6">
                        {currentProperty.details.numberOfUnits}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Year Built
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CalendarToday sx={{ mr: 1 }} />
                        <Typography>{currentProperty.details.yearBuilt}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Details */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Target Rent Range
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <AttachMoney sx={{ mr: 1 }} />
                        <Typography>
                          ${currentProperty.details.targetRentRange.min} - $
                          {currentProperty.details.targetRentRange.max} / month
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {currentProperty.details.specialFeatures && (
                    <Grid item xs={12}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Special Features
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          {currentProperty.details.specialFeatures}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              {/* Amenities */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Current Amenities
                </Typography>
                {currentProperty.details.currentAmenities.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentProperty.details.currentAmenities.map((amenity: any, index: number) => (
                      <Chip key={index} label={amenity} />
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">No amenities listed</Typography>
                )}
              </TabPanel>

              {/* Location */}
              <TabPanel value={tabValue} index={3}>
                <Box>
                  {currentProperty.details.nearbyLandmarks &&
                  currentProperty.details.nearbyLandmarks.length > 0 ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Nearby Landmarks
                      </Typography>
                      <List>
                        {currentProperty.details.nearbyLandmarks.map((landmark: any, index: number) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemText primary={landmark} />
                            </ListItem>
                            {index < currentProperty.details.nearbyLandmarks!.length - 1 && (
                              <Divider />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      No nearby landmarks specified
                    </Typography>
                  )}
                  {currentProperty.latitude && currentProperty.longitude && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Coordinates
                      </Typography>
                      <Typography>
                        {currentProperty.latitude}, {currentProperty.longitude}
                      </Typography>

                      {/* Satellite Image */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Satellite View
                        </Typography>
                        <PropertyMap
                          latitude={currentProperty.latitude}
                          longitude={currentProperty.longitude}
                          address={`${currentProperty.address.street}, ${currentProperty.address.city}, ${currentProperty.address.state} ${currentProperty.address.zip}`}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Tenant Profile */}
              <TabPanel value={tabValue} index={4}>
                {tenantProfile ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Ideal Tenant Profile
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Confidence:
                          </Typography>
                          <Box 
                            sx={{ 
                              px: 2, 
                              py: 0.5, 
                              borderRadius: 1,
                              bgcolor: getConfidenceColor(tenantProfile.confidence),
                              color: 'white'
                            }}
                          >
                            {Math.round((tenantProfile.confidence || 0) * 100)}%
                          </Box>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => setDeleteDialogOpen(true)}
                          size="small"
                          title="Delete Tenant Profile"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Demographics
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Age Range"
                              secondary={`${tenantProfile.demographics.ageRange.min || 0}-${tenantProfile.demographics.ageRange.max || 0} years`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Income Range"
                              secondary={`$${tenantProfile.demographics.incomeRange.min?.toLocaleString() || '0'}-$${tenantProfile.demographics.incomeRange.max?.toLocaleString() || '0'}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Family Composition"
                              secondary={tenantProfile.demographics.familyComposition.join(', ')}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Professional Backgrounds"
                              secondary={tenantProfile.demographics.professionalBackgrounds.join(', ')}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Preferences
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Transportation Needs"
                              secondary={tenantProfile.preferences.transportationNeeds.join(', ')}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Pet Ownership"
                              secondary={tenantProfile.preferences.petOwnership ? 'Yes' : 'No'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Amenity Priorities"
                              secondary={tenantProfile.preferences.amenityPriorities.join(', ')}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      {tenantProfile.summary && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Summary
                          </Typography>
                          <Typography sx={{ mt: 1 }}>{tenantProfile.summary}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" py={4}>
                    <Button
                      variant="contained"
                      startIcon={<ChatIcon />}
                      onClick={() => setChatOpen(true)}
                    >
                      Generate Tenant Profile
                    </Button>
                  </Box>
                )}
                {/* Chat dialog */}
                <Dialog
                  open={chatOpen}
                  maxWidth="md"
                  fullWidth
                  onClose={() => setChatOpen(false)}
                >
                  <DialogTitle>Generate Tenant Profile</DialogTitle>
                  <DialogContent>
                    <TenantProfileChat
                      propertyId={id!}
                      onComplete={handleTenantProfileComplete}
                      onCancel={() => setChatOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Tenant Profile Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Tenant Profile</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this tenant profile? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (tenantProfile?.id) {
                deleteTenantProfileMutation.mutate(tenantProfile.id);
              }
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PropertyDetail;
