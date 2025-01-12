import { useState } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeveloperCard from '../components/DeveloperCard';
import { useDevelopers } from '../contexts/DevelopersContext';

const ALL_SKILLS = [
  'React', 'Node.js', 'Python', 'Solidity', 'Smart Contracts', 
  'DeFi', 'Web3', 'Blockchain', 'Rust', 'Frontend', 'Security'
];

function DevelopersList() {
  const { developers } = useDevelopers();
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [rateSort, setRateSort] = useState('any');

  const filteredDevelopers = developers.filter(dev => {
    const matchesSearch = dev.name.toLowerCase().includes(search.toLowerCase()) ||
      dev.bio.toLowerCase().includes(search.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => dev.expertise.includes(skill));
    
    return matchesSearch && matchesSkills;
  }).sort((a, b) => {
    if (rateSort === 'low') return a.rate - b.rate;
    if (rateSort === 'high') return b.rate - a.rate;
    return 0;
  });

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Developers
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Select
                  value={rateSort}
                  onChange={(e) => setRateSort(e.target.value)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="any">Sort by: Rate (Any)</MenuItem>
                  <MenuItem value="low">Rate (Low to High)</MenuItem>
                  <MenuItem value="high">Rate (High to Low)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Filter by Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ALL_SKILLS.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={selectedSkills.includes(skill) ? "primary" : "default"}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {filteredDevelopers.map((developer) => (
            <Grid item xs={12} sm={6} md={4} key={developer.id}>
              <DeveloperCard developer={developer} />
            </Grid>
          ))}
          {filteredDevelopers.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" align="center">
                No developers found matching your criteria
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}

export default DevelopersList; 