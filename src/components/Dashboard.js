import React from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Il ProtectedRoute si occuperà del reindirizzamento
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Benvenuto, {user?.username || 'Utente'}!
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Email: {user?.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Ruolo: {user?.role || 'utente'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Account creato il: {new Date(user?.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              sx={{
                backgroundColor: '#ff4081',
                '&:hover': {
                  backgroundColor: '#f50057',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 