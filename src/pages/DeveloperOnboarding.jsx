import { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Stepper, 
  Step, 
  StepLabel,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';
import { useDevelopers } from '../contexts/DevelopersContext';

const steps = ['Profile Details', 'Connect Wallet', 'Set Rate & Schedule'];

const SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Solidity', 
  'Smart Contracts', 'DeFi', 'Web3', 'Blockchain'
];

const TIMEZONES = [
  'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3',
  'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5'
];

function DeveloperOnboarding() {
  const navigate = useNavigate();
  const { account, connectWallet } = useWeb3();
  const [activeStep, setActiveStep] = useState(0);
  const { addDeveloper } = useDevelopers();
  
  const [profile, setProfile] = useState({
    fullName: '',
    bio: '',
    skills: [],
    languages: '',
    timezone: '',
    githubUrl: '',
    linkedinUrl: '',
    hourlyRate: '',
    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false }
    }
  });

  const handleSkillClick = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      const newDeveloper = {
        name: profile.fullName,
        expertise: profile.skills,
        rate: parseFloat(profile.hourlyRate),
        rating: 0,
        available: true,
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500",
        bio: profile.bio,
        completedSessions: 0,
        languages: profile.languages.split(',').map(lang => lang.trim()),
        timezone: profile.timezone,
        walletAddress: account
      };

      addDeveloper(newDeveloper);
      navigate('/developers');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderProfileDetails = () => (
    <Box sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Full Name"
        value={profile.fullName}
        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Bio"
        multiline
        rows={4}
        value={profile.bio}
        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        sx={{ mb: 2 }}
      />
      <Typography variant="subtitle1" gutterBottom>
        Skills
      </Typography>
      <Box sx={{ mb: 2 }}>
        {SKILLS.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            onClick={() => handleSkillClick(skill)}
            color={profile.skills.includes(skill) ? "primary" : "default"}
            sx={{ m: 0.5 }}
          />
        ))}
      </Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Timezone</InputLabel>
        <Select
          value={profile.timezone}
          label="Timezone"
          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
        >
          {TIMEZONES.map((tz) => (
            <MenuItem key={tz} value={tz}>{tz}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Languages"
        placeholder="e.g., English, Spanish"
        value={profile.languages}
        onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
        sx={{ mb: 2 }}
      />
    </Box>
  );

  const renderWalletConnection = () => (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      {account ? (
        <>
          <Typography variant="h6" gutterBottom color="primary">
            Wallet Connected
          </Typography>
          <Typography color="textSecondary">
            {account}
          </Typography>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            size="large"
            onClick={async () => {
              try {
                await connectWallet();
              } catch (error) {
                console.error('Failed to connect wallet:', error);
                // You might want to show an error message to the user
              }
            }}
          >
            Connect Wallet
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please make sure you have MetaMask installed
          </Typography>
        </>
      )}
    </Box>
  );

  const renderRateAndSchedule = () => (
    <Box sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Hourly Rate (ETH)"
        type="number"
        InputProps={{
          startAdornment: <InputAdornment position="start">Ξ</InputAdornment>,
        }}
        value={profile.hourlyRate}
        onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
        sx={{ mb: 3 }}
      />
      <Typography variant="h6" gutterBottom>
        Availability Schedule
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(profile.availability).map(([day, slots]) => (
          <Grid item xs={12} key={day}>
            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
              {day}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {Object.entries(slots).map(([slot, isAvailable]) => (
                <Chip
                  key={slot}
                  label={slot}
                  onClick={() => {
                    setProfile(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        [day]: {
                          ...prev.availability[day],
                          [slot]: !isAvailable
                        }
                      }
                    }));
                  }}
                  color={isAvailable ? "primary" : "default"}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderProfileDetails();
      case 1:
        return renderWalletConnection();
      case 2:
        return renderRateAndSchedule();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Become a Developer
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 1 && !account}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default DeveloperOnboarding; 