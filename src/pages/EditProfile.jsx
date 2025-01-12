import { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useDevelopers } from '../contexts/DevelopersContext';

const SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Solidity', 
  'Smart Contracts', 'DeFi', 'Web3', 'Blockchain'
];

const TIMEZONES = [
  'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3',
  'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5'
];

function EditProfile() {
  const navigate = useNavigate();
  const { account } = useWeb3();
  const { getDeveloperByWallet, updateDeveloper } = useDevelopers();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (account) {
      const developerProfile = getDeveloperByWallet(account);
      if (developerProfile) {
        setProfile({
          fullName: developerProfile.name,
          bio: developerProfile.bio,
          skills: developerProfile.expertise,
          languages: developerProfile.languages.join(', '),
          timezone: developerProfile.timezone,
          hourlyRate: developerProfile.rate.toString(),
        });
      } else {
        navigate('/onboarding');
      }
    }
  }, [account, getDeveloperByWallet]);

  const handleSkillClick = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = () => {
    const developer = getDeveloperByWallet(account);
    if (developer) {
      updateDeveloper(developer.id, {
        name: profile.fullName,
        bio: profile.bio,
        expertise: profile.skills,
        languages: profile.languages.split(',').map(lang => lang.trim()),
        timezone: profile.timezone,
        rate: parseFloat(profile.hourlyRate),
      });
      navigate('/developers');
    }
  };

  if (!profile) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Edit Profile
        </Typography>
        
        <Box sx={{ mt: 4 }}>
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

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/developers')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditProfile; 