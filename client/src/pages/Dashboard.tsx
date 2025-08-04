import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  TrendingUp,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { trpc } from '../trpc';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch properties with tRPC
  const { data, isLoading: loading } = trpc.property.list.useQuery();
  const properties = data?.properties ?? [];

  const stats = [
    {
      title: 'Total Properties',
      value: properties.length,
      icon: <HomeIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Analyses Completed',
      value: properties.filter((p: any) => p.id).length, // placeholder
      icon: <AssessmentIcon fontSize="large" />,
      color: '#388e3c',
    },
    {
      title: 'Average ROI',
      value: '15%', // placeholder
      icon: <TrendingUp fontSize="large" />,
      color: '#f57c00',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Here's an overview of your property portfolio and recent analyses.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={2}
              sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
              </Box>
              <Box sx={{ color: stat.color }}>{stat.icon}</Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Properties
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No properties yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              Add your first property to get started with AI-powered tenant profiling and amenity recommendations.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/properties/new')}
              sx={{ mt: 2 }}
            >
              Add First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {properties.slice(0, 3).map((property: any) => (
            <Grid item xs={12} md={4} key={property.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {property.name}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {property.address.street}, {property.address.city}, {property.address.state}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">Units: {property.details.numberOfUnits}</Typography>
                    <Typography variant="body2">Type: {property.details.propertyType}</Typography>
                    <Typography variant="body2">Year Built: {property.details.yearBuilt}</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/properties/${property.id}`)}>
                    View Details
                  </Button>
                  <Button size="small" color="primary" onClick={() => navigate(`/properties/${property.id}/analysis`)}>
                    Run Analysis
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {properties.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/properties')}>
            View All Properties
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
