import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        mt: 8, 
        mb: 4, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            DevConnect
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Connect with Expert Developers
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/developers')}
            >
              Find a Developer
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/onboarding')}
            >
              Become a Developer
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Home; 