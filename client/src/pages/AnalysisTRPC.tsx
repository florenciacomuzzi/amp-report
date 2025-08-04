import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Step,
  StepLabel,
  Stepper,
  Typography,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Psychology,
  Lightbulb,
  TrendingUp,
  Send,
} from '@mui/icons-material';
import { trpc } from '../trpc';

const steps = ['Generate Tenant Profile', 'Get Recommendations', 'Review'];

export default function AnalysisTRPC() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /* queries */
  const propertyQuery = trpc.property.get.useQuery(id!, { enabled: !!id });
  const amenitiesQuery = trpc.amenity.list.useQuery();

  /* mutations */
  const generateProfile = trpc.analysis.generateTenantProfile.useMutation();
  const recommendationsMutation = trpc.analysis.recommendations.useMutation();
  const chatMutation = trpc.analysis.chat.useMutation();

  /* local state */
  const [activeStep, setActiveStep] = useState(0);
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);

  const loading =
    propertyQuery.isLoading ||
    amenitiesQuery.isLoading ||
    generateProfile.isLoading ||
    recommendationsMutation.isLoading;

  const handleGenerateTenantProfile = async () => {
    if (!id) return;
    const { tenantProfile } = await generateProfile.mutateAsync({ propertyId: id });
    setTenantProfile(tenantProfile);
    setActiveStep(1);
  };

  const handleGetRecommendations = async () => {
    if (!id || !tenantProfile) return;
    const { analysis: a, recommendations } = await recommendationsMutation.mutateAsync({
      propertyId: id,
      tenantProfileId: (tenantProfile as any).id,
    });
    setAnalysis({ ...a, amenityRecommendations: recommendations });
    setActiveStep(2);
  };

  const handleSendMessage = async () => {
    if (!id || !chatMessage) return;
    setChatHistory([...chatHistory, { role: 'user', content: chatMessage }]);
    const { response } = await chatMutation.mutateAsync({ propertyId: id, message: chatMessage });
    setChatHistory((prev) => [...prev, { role: 'assistant', content: response }]);
    setChatMessage('');
  };

  if (propertyQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!propertyQuery.data?.property) {
    return (
      <Box p={4}>
        <Typography>Property not found.</Typography>
      </Box>
    );
  }

  const property = propertyQuery.data.property as any;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(`/properties/${id}`)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Analysis for {property.name}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Psychology sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Generate AI-Powered Tenant Profile
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Our AI will analyze your property location, characteristics, and market data to
                  create an ideal tenant profile.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerateTenantProfile}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
                >
                  {loading ? 'Generating…' : 'Generate Tenant Profile'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && tenantProfile && (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Ideal Tenant Profile
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Demographics
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Age Range"
                          secondary={`${tenantProfile.demographics.ageRange.min || 0} - ${tenantProfile.demographics.ageRange.max || 0} years`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Income Range"
                          secondary={`$${tenantProfile.demographics.incomeRange.min?.toLocaleString() || '0'} - $${tenantProfile.demographics.incomeRange.max?.toLocaleString() || '0'}`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Preferences
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Transportation Needs
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {tenantProfile.preferences.transportationNeeds.map((need: string, idx: number) => (
                          <Chip key={idx} label={need} size="small" />
                        ))}
                      </Box>
                    </Box>
                    {/* Add more preference details as needed */}
                  </Grid>
                </Grid>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<Lightbulb />}
                    disabled={recommendationsMutation.isLoading}
                    onClick={handleGetRecommendations}
                  >
                    {recommendationsMutation.isLoading ? 'Generating…' : 'Get Recommendations'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && analysis && (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Recommended Amenities
                </Typography>
                {analysis.amenityRecommendations.map((rec: any) => (
                  <Chip
                    key={rec.amenityId}
                    label={`${rec.priority.toUpperCase()} – Score: ${rec.score.toFixed(0)}`}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Chat
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                {chatHistory.map((m, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {m.role}
                    </Typography>
                    <Typography variant="body2">{m.content}</Typography>
                  </Box>
                ))}
              </Box>
              <TextField
                fullWidth
                size="small"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask a question…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                InputProps={{ endAdornment: <Send onClick={handleSendMessage} sx={{ cursor: 'pointer' }} /> }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
