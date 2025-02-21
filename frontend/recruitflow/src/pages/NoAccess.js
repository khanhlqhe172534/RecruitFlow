import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NoAccess = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleBackClick = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Paper
          elevation={5}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 3,
            backgroundColor: '#fff',
          }}
        >
          <LockOutlinedIcon 
            sx={{ 
              fontSize: 100, 
              color: 'error.main',
              mb: 2 
            }} 
          />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'error.main',
              textAlign: 'center',
            }}
          >
            Access Denied
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            You don’t have permission to view this page. Please log in or go back to the home page.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{
                minWidth: '160px',
                color: 'error.main',
                borderColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  borderColor: 'error.main',
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeOutlinedIcon />}
              onClick={handleHomeClick}
              sx={{
                minWidth: '160px',
                backgroundColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.dark',
                },
              }}
            >
              Home Page
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NoAccess;
