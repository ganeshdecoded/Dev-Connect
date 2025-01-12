import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Switch, 
  FormControlLabel,
  Button,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useBooking } from '../contexts/BookingContext';
import { useDevelopers } from '../contexts/DevelopersContext';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function Dashboard() {
  const navigate = useNavigate();
  const { account, connectWallet } = useWeb3();
  const { bookings } = useBooking();
  const { developers } = useDevelopers();
  const [isAvailable, setIsAvailable] = useState(true);

  const handleStartCall = (bookingId) => {
    navigate(`/call/${bookingId}`);
  };

  const renderBookingStatus = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'info',
      active: 'success',
      completed: 'default'
    };
    return <Chip size="small" color={statusColors[status]} label={status} />;
  };

  const renderBookings = () => {
    const activeBookings = bookings.filter(booking => 
      booking.status === 'confirmed' || booking.status === 'active'
    );

    if (activeBookings.length === 0) {
      return (
        <Typography color="text.secondary" align="center">
          No active bookings found
        </Typography>
      );
    }

    return activeBookings.map((booking) => {
      const developer = developers.find(d => d.id === booking.developerId);
      return (
        <Paper 
          key={booking.id} 
          sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2">Developer</Typography>
              <Typography>{developer?.name || 'Unknown'}</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle2">Duration</Typography>
              <Typography>{booking.duration} hour(s)</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle2">Amount</Typography>
              <Typography>{booking.amount} ETH</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle2">Status</Typography>
              {renderBookingStatus(booking.status)}
            </Grid>
            <Grid item xs={12} sm={3}>
              {booking.status === 'confirmed' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<VideocamIcon />}
                  onClick={() => handleStartCall(booking.id)}
                  fullWidth
                >
                  Start Call
                </Button>
              )}
              {booking.status === 'active' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<VideocamIcon />}
                  onClick={() => handleStartCall(booking.id)}
                  fullWidth
                >
                  Join Call
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      );
    });
  };

  if (!account) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please connect your wallet to access the dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={connectWallet}
            sx={{ mt: 2 }}
          >
            Connect Wallet
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Dashboard</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                }
                label={isAvailable ? "Available" : "Unavailable"}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Sessions
            </Typography>
            {renderBookings()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 