import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Link
} from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { useDevelopers } from '../contexts/DevelopersContext';
import { useBooking } from '../contexts/BookingContext';

const steps = ['Select Duration', 'Review & Pay', 'Confirmation'];

function Booking() {
  const { developerId } = useParams();
  const navigate = useNavigate();
  const { account, web3 } = useWeb3();
  const { developers } = useDevelopers();
  const { createBooking } = useBooking();

  const [activeStep, setActiveStep] = useState(0);
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [developer, setDeveloper] = useState(null);
  const [balance, setBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('mock');

  useEffect(() => {
    const dev = developers.find(d => d.id === parseInt(developerId));
    if (!dev) {
      navigate('/developers');
    }
    setDeveloper(dev);
  }, [developerId, developers]);

  useEffect(() => {
    const checkBalance = async () => {
      if (web3 && account) {
        const balanceWei = await web3.eth.getBalance(account);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        setBalance(parseFloat(balanceEth));
      }
    };
    checkBalance();
  }, [web3, account]);

  const calculateTotal = () => {
    return developer ? developer.rate * duration : 0;
  };

  const handleMockPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking record
      await createBooking({
        developerId: developer.id,
        customerAddress: account,
        developerAddress: developer.walletAddress,
        duration,
        amount: calculateTotal(),
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        paymentMethod: 'mock',
        status: 'confirmed'
      });

      setActiveStep(2);
    } catch (err) {
      setError('Mock payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!account || !web3 || !developer) return;

    setLoading(true);
    setError('');

    try {
      const totalAmount = web3.utils.toWei(calculateTotal().toString(), 'ether');
      
      // Check if user has enough balance
      if (balance < calculateTotal()) {
        throw new Error(`Insufficient funds. You need ${calculateTotal()} ETH but have ${balance.toFixed(4)} ETH`);
      }

      // Send payment transaction
      await web3.eth.sendTransaction({
        from: account,
        to: developer.walletAddress,
        value: totalAmount,
        gas: '50000' // Specify gas limit
      });

      // Create booking record
      await createBooking({
        developerId: developer.id,
        customerAddress: account,
        developerAddress: developer.walletAddress,
        duration,
        amount: calculateTotal(),
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
      });

      setActiveStep(2);
    } catch (err) {
      console.error('Payment failed:', err);
      if (err.message.includes('insufficient funds')) {
        setError(`Insufficient funds. Please make sure you have enough ETH in your wallet. 
          You can get test ETH from the Sepolia faucet.`);
      } else {
        setError(err.message || 'Transaction failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!developer) return null;

  const renderDurationSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Session Duration
      </Typography>
      <TextField
        fullWidth
        type="number"
        label="Duration (hours)"
        value={duration}
        onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value)))}
        InputProps={{ inputProps: { min: 1 } }}
        sx={{ mb: 2 }}
      />
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Rate: {developer.rate} ETH/hour
      </Typography>
      <Typography variant="h6">
        Total: {calculateTotal()} ETH
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Your balance: {balance.toFixed(4)} ETH
      </Typography>
    </Box>
  );

  const renderPaymentMethod = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Select Payment Method
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant={paymentMethod === 'mock' ? 'contained' : 'outlined'}
            onClick={() => setPaymentMethod('mock')}
            sx={{ height: '100%' }}
          >
            Test Payment
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              (No real ETH required)
            </Typography>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant={paymentMethod === 'real' ? 'contained' : 'outlined'}
            onClick={() => setPaymentMethod('real')}
            sx={{ height: '100%' }}
          >
            Real ETH Payment
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              (Requires Sepolia ETH)
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPayment = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Booking Summary
      </Typography>
      {renderPaymentMethod()}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2">Developer</Typography>
            <Typography gutterBottom>{developer.name}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Duration</Typography>
            <Typography gutterBottom>{duration} hour(s)</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Rate</Typography>
            <Typography gutterBottom>{developer.rate} ETH/hour</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Total Amount</Typography>
            <Typography variant="h6">{calculateTotal()} ETH</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your balance: {balance.toFixed(4)} ETH
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
          {paymentMethod === 'real' && error.includes('insufficient funds') && (
            <Box sx={{ mt: 1 }}>
              <Link 
                href="https://sepoliafaucet.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Get test ETH from Sepolia Faucet
              </Link>
            </Box>
          )}
        </Alert>
      )}
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={paymentMethod === 'mock' ? handleMockPayment : handlePayment}
        disabled={loading || !account || (paymentMethod === 'real' && balance < calculateTotal())}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Confirm & Pay'}
      </Button>
    </Box>
  );

  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom color="primary">
        Booking Confirmed!
      </Typography>
      <Typography paragraph>
        Your session with {developer.name} has been scheduled.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/dashboard')}
      >
        View Booking Details
      </Button>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderDurationSelection();
      case 1:
        return renderPayment();
      case 2:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Book a Session
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        {activeStep !== 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveStep((prev) => prev + 1)}
              disabled={activeStep === 1}
            >
              {activeStep === 0 ? 'Continue to Payment' : 'Confirm'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Booking; 