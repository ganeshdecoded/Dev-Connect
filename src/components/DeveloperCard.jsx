import { Card, CardContent, CardMedia, Typography, Chip, Button, Box, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

function DeveloperCard({ developer }) {
  const navigate = useNavigate();
  const { account } = useWeb3();
  const isOwnProfile = account && developer.walletAddress === account;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={developer.image}
        alt={developer.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {developer.name}
          {isOwnProfile && (
            <Chip
              label="You"
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Box sx={{ mb: 2 }}>
          {developer.expertise.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
        <Box sx={{ mb: 1 }}>
          <Rating value={developer.rating} readOnly precision={0.5} />
          <Typography variant="body2" color="text.secondary">
            ({developer.completedSessions} sessions)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Rate: {developer.rate} ETH/hour
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {developer.languages.join(', ')}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
          {developer.bio}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate(`/developer/${developer.id}`)}
        >
          {isOwnProfile ? 'View Profile' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default DeveloperCard; 