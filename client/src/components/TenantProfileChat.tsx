import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Demographics, Preferences, Lifestyle } from '../types';
import { trpc } from '../trpc';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface TenantProfileChatProps {
  propertyId: string;
  onComplete: (profile: {
    demographics: Demographics;
    preferences: Preferences;
    lifestyle: Lifestyle[];
    conversationHistory: ChatMessage[];
  }) => void;
  onCancel?: () => void;
}

const TenantProfileChat: React.FC<TenantProfileChatProps> = ({
  propertyId,
  onComplete,
  onCancel,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TRPC mutation for chat
  const chatMutation = trpc.tenantProfile.chat.useMutation();

  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: "Hello! I'll help you create an ideal tenant profile for your property. Let's start by understanding what kind of tenants would be perfect for your property. Could you tell me about the ideal age range and income level you're looking for?",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        propertyId,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (result.extractedProfile) {
        setExtractedProfile(result.extractedProfile);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (!extractedProfile) {
      alert('Please continue the conversation until we have enough information about your ideal tenant.');
      return;
    }

    const profileData = {
      demographics: extractedProfile.demographics || {
        ageRange: { min: 25, max: 45 },
        incomeRange: { min: 50000, max: 100000 },
        familyComposition: [],
        professionalBackgrounds: [],
      },
      preferences: extractedProfile.preferences || {
        transportationNeeds: [],
        petOwnership: false,
        amenityPriorities: [],
      },
      lifestyle: extractedProfile.lifestyle || [],
      conversationHistory: messages,
      confidence: extractedProfile.confidence,
      summary: extractedProfile.summary,
    };

    onComplete(profileData);
  };

  const handleReset = () => {
    setMessages([]);
    setExtractedProfile(null);
    
    const initialMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: "Hello! I'll help you create an ideal tenant profile for your property. Let's start by understanding what kind of tenants would be perfect for your property. Could you tell me about the ideal age range and income level you're looking for?",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  };

  const isProfileComplete = () => {
    if (!extractedProfile) return false;
    
    const hasBasicDemographics = 
      extractedProfile.demographics?.ageRange?.min > 0 &&
      extractedProfile.demographics?.incomeRange?.min > 0;
    
    const hasPreferences = 
      extractedProfile.preferences?.transportationNeeds?.length > 0 ||
      extractedProfile.preferences?.amenityPriorities?.length > 0;
    
    return hasBasicDemographics || hasPreferences;
  };

  return (
    <Paper elevation={3} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">AI Tenant Profile Assistant</Typography>
        <Box>
          <IconButton onClick={handleReset} size="small" title="Start Over">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 30, height: 30, mr: 1 }}>
                  {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
              <Card
                sx={{
                  maxWidth: '80%',
                  backgroundColor: message.role === 'user' ? 'primary.light' : 'grey.100',
                }}
              >
                <CardContent sx={{ py: 1 }}>
                  <Typography style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Typography>
                </CardContent>
              </Card>
            </ListItem>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress size={20} />
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {extractedProfile && isProfileComplete() && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'success.light' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Profile information gathered! Click "Save Profile" when ready.
            {extractedProfile.confidence && (
              <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
                (Confidence: {Math.round(extractedProfile.confidence * 100)}%)
              </span>
            )}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {extractedProfile.demographics?.ageRange?.min > 0 && (
              <Chip 
                size="small" 
                label={`Age: ${extractedProfile.demographics.ageRange.min}-${extractedProfile.demographics.ageRange.max}`} 
              />
            )}
            {extractedProfile.demographics?.incomeRange?.min > 0 && (
              <Chip 
                size="small" 
                label={`Income: $${Math.round(extractedProfile.demographics.incomeRange.min/1000)}k-$${Math.round(extractedProfile.demographics.incomeRange.max/1000)}k`} 
              />
            )}
            {extractedProfile.preferences?.petOwnership !== undefined && (
              <Chip 
                size="small" 
                label={`Pets: ${extractedProfile.preferences.petOwnership ? 'Yes' : 'No'}`} 
              />
            )}
          </Box>
        </Box>
      )}

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading}
            multiline
            maxRows={3}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleComplete}
            disabled={!isProfileComplete()}
            startIcon={<SaveIcon />}
          >
            Save Profile
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TenantProfileChat;