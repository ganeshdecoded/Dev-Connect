import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Grid, Paper, Alert } from '@mui/material';
import { useVideo } from '../contexts/VideoContext';
import { useWeb3 } from '../contexts/Web3Context';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar';

function VideoCall() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { account, connectWallet } = useWeb3();
  const {
    localAudioTrack,
    localVideoTrack,
    joinState,
    remoteUsers,
    join,
    leave,
    reconnecting,
    activeSession
  } = useVideo();

  const localVideoRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle wallet connection
  useEffect(() => {
    const connectToWallet = async () => {
      if (!account && !isConnecting) {
        setIsConnecting(true);
        try {
          await connectWallet();
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          setError('Failed to connect wallet. Please try again.');
        } finally {
          setIsConnecting(false);
        }
      }
    };

    connectToWallet();
  }, [account, connectWallet, isConnecting]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    // Only proceed if wallet is connected
    if (!account) {
      return;
    }

    const isDeveloper = window.location.pathname.includes('/call/dev-');
    setIsHost(isDeveloper);

    const startCall = async () => {
      try {
        setError('');
        // Remove any 'dev-' prefix from the session ID for the channel name
        const baseSessionId = sessionId.replace('dev-', '');
        
        // Add a random suffix to the UID to prevent conflicts
        const uniqueUid = `${account}-${Math.random().toString(36).substr(2, 9)}`;
        
        await join(baseSessionId, null, uniqueUid, isDeveloper ? 'host' : 'audience');
      } catch (error) {
        console.error('Failed to join call:', error);
        setError(error.message || 'Failed to join call');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    };

    startCall();

    return () => {
      leave();
    };
  }, [sessionId, account]);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current && isHost) {
      localVideoTrack.play(localVideoRef.current);
    }
    return () => {
      if (localVideoTrack) {
        localVideoTrack.stop();
      }
    };
  }, [localVideoTrack, isHost]);

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleEndCall = async () => {
    await leave();
    navigate('/dashboard');
  };

  const renderRemoteUsers = () => {
    console.log('Remote users:', remoteUsers); // Debug log

    if (remoteUsers.length === 0) {
      return (
        <Grid item xs={12}>
          <Alert severity="info">
            {isHost ? 'Waiting for client to join...' : 'Waiting for developer to join...'}
          </Alert>
        </Grid>
      );
    }

    return remoteUsers.map(user => (
      <Grid item xs={12} md={6} key={user.uid}>
        <Paper
          elevation={3}
          sx={{
            height: '300px',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#000'
          }}
        >
          <div
            ref={element => {
              if (element && user.videoTrack) {
                try {
                  user.videoTrack.play(element);
                } catch (error) {
                  console.error('Error playing video track:', error);
                }
              }
            }}
            style={{ width: '100%', height: '100%' }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle2">
              {user.uid.includes('host') ? 'Developer' : 'Client'}
            </Typography>
            {user.audioTrack && (
              <MicIcon fontSize="small" color={user.audioTrack.enabled ? 'inherit' : 'error'} />
            )}
          </Box>
        </Paper>
      </Grid>
    ));
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!account ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Alert severity="info">Please connect your wallet to join the call</Alert>
          <Button 
            variant="contained" 
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {reconnecting && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Reconnecting to call...
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 2 }}>
            {isHost ? 
              'You are connected as a Developer (Host)' : 
              'You are connected as a Client (Audience)'
            }
          </Alert>

          <Grid container spacing={2} sx={{ flex: 1 }}>
            {/* Local Video for Host */}
            {isHost && (
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    height: '300px',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#000'
                  }}
                >
                  <div
                    ref={localVideoRef}
                    style={{ width: '100%', height: '100%' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      padding: '4px 8px',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle2">
                      You (Developer)
                    </Typography>
                    <MicIcon fontSize="small" color={audioEnabled ? 'inherit' : 'error'} />
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Remote Users */}
            {renderRemoteUsers()}
          </Grid>

          {/* Controls */}
          {isHost ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 3 }}>
              <Button
                variant="contained"
                color={audioEnabled ? 'primary' : 'error'}
                onClick={toggleAudio}
                startIcon={audioEnabled ? <MicIcon /> : <MicOffIcon />}
              >
                {audioEnabled ? 'Mute' : 'Unmute'}
              </Button>
              <Button
                variant="contained"
                color={videoEnabled ? 'primary' : 'error'}
                onClick={toggleVideo}
                startIcon={videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
              >
                {videoEnabled ? 'Stop Video' : 'Start Video'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleEndCall}
                startIcon={<CallEndIcon />}
              >
                End Call
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleEndCall}
                startIcon={<CallEndIcon />}
              >
                Leave Call
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default VideoCall; 