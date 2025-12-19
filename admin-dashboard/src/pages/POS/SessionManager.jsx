import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import toast from 'react-hot-toast';

const POSSessionManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [openingCash, setOpeningCash] = useState('0.00');
  const [closingCash, setClosingCash] = useState('0.00');
  const [closingNotes, setClosingNotes] = useState('');

  useEffect(() => {
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    try {
      const response = await api.get('/pos/sessions/current/');
      setCurrentSession(response.data);
    } catch (error) {
      // No active session
      setCurrentSession(null);
    }
  };

  const handleOpenSession = async () => {
    setLoading(true);
    try {
      const response = await api.post('/pos/sessions/', {
        opening_cash: parseFloat(openingCash),
        opening_notes: '',
      });

      setCurrentSession(response.data);
      toast.success('POS Session opened successfully!');
      navigate('/pos/terminal');
    } catch (error) {
      console.error('Error opening session:', error);
      toast.error(error.response?.data?.error || 'Failed to open session');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!window.confirm('Are you sure you want to close this session?')) {
      return;
    }

    setLoading(true);
    try {
      await api.post(
        `/pos/sessions/${currentSession.id}/close_session/`,
        {
          closing_cash: parseFloat(closingCash),
          closing_notes: closingNotes,
        }
      );

      toast.success('Session closed successfully!');
      setCurrentSession(null);
      checkCurrentSession();
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session');
    } finally {
      setLoading(false);
    }
  };

  if (currentSession && currentSession.status === 'open') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Active POS Session
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            Session {currentSession.session_number} is currently active
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Session Details</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Session ID:</strong> {currentSession.session_number}
                </Typography>
                <Typography variant="body2">
                  <strong>Opened:</strong> {new Date(currentSession.opened_at).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Opening Cash:</strong> KES {parseFloat(currentSession.opening_cash).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Sales:</strong> KES {parseFloat(currentSession.total_sales).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Transactions:</strong> {currentSession.total_transactions}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => navigate('/pos/terminal')}
                sx={{ mb: 2 }}
              >
                Go to POS Terminal
              </Button>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Close Session
              </Typography>

              <TextField
                fullWidth
                label="Closing Cash Amount"
                type="number"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ step: '0.01' }}
              />

              <TextField
                fullWidth
                label="Closing Notes"
                multiline
                rows={3}
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                color="error"
                size="large"
                fullWidth
                onClick={handleCloseSession}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Stop />}
              >
                Close Session
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Open POS Session
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Start a new POS session to begin processing sales.
        </Typography>

        <TextField
          fullWidth
          label="Opening Cash Amount"
          type="number"
          value={openingCash}
          onChange={(e) => setOpeningCash(e.target.value)}
          sx={{ mb: 3 }}
          inputProps={{ step: '0.01' }}
          helperText="Enter the cash amount in the register at the start of your shift"
        />

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleOpenSession}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
        >
          Open Session
        </Button>
      </Paper>
    </Container>
  );
};

export default POSSessionManager;
