import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Chip, Button, Grid, Paper } from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { useDevelopers } from '../contexts/DevelopersContext';

function DeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState(null);
  const { account } = useWeb3();
  const { developers } = useDevelopers();

  useEffect(() => {
    const dev = developers.find(d => d.id === parseInt(id));
    if (!dev) {
      navigate('/developers');
    }
    setDeveloper(dev);
  }, [id, developers, navigate]);

  const handleBooking = () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    navigate(`/booking/${developer.id}`);
  };

  if (!developer) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box
              component="img"
              src={developer.image}
              alt={developer.name}
              sx={{ width: '100%', borderRadius: 1 }}
            />
            <Typography variant="h5" sx={{ mt: 2 }}>
              {developer.name}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {developer.expertise.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography paragraph>{developer.bio}</Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Rate</Typography>
                <Typography>{developer.rate} ETH/hour</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Rating</Typography>
                <Typography>{developer.rating}/5</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Sessions Completed</Typography>
                <Typography>{developer.completedSessions}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Languages</Typography>
                <Typography>{developer.languages.join(', ')}</Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!developer.available}
                onClick={handleBooking}
              >
                {!account 
                  ? 'Connect Wallet to Book'
                  : !developer.available 
                    ? 'Currently Unavailable' 
                    : 'Book Session'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DeveloperProfile; 