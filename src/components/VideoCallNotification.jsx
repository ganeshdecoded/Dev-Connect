import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useVideo } from '../contexts/VideoContext';

function VideoCallNotification() {
  const navigate = useNavigate();
  const { activeSession } = useVideo();

  const handleJoinCall = () => {
    if (activeSession) {
      navigate(`/call/${activeSession.roomName}`);
    }
  };

  return (
    <Snackbar
      open={!!activeSession}
      message="Active video call in progress"
      action={
        <Button
          color="primary"
          size="small"
          startIcon={<VideocamIcon />}
          onClick={handleJoinCall}
        >
          Join Call
        </Button>
      }
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      sx={{ bottom: { xs: 90, sm: 0 } }}
    />
  );
}

export default VideoCallNotification; 