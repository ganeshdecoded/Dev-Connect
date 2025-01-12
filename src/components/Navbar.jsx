import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Badge,
  Popover
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useVideo } from '../contexts/VideoContext';
import { useNotifications } from '../contexts/NotificationsContext';

// Import Material Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VideocamIcon from '@mui/icons-material/Videocam';

function Navbar() {
  const navigate = useNavigate();
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const { activeSession } = useVideo();
  const { notifications } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    disconnectWallet();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/dashboard');
  };

  const handleJoinCall = () => {
    if (activeSession) {
      navigate(`/call/${activeSession.roomName}`);
      handleNotificationClose();
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ cursor: 'pointer' }} 
          onClick={() => navigate('/')}
        >
          DevConnect
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button 
          color="inherit" 
          onClick={() => navigate('/developers')}
          sx={{ mr: 2 }}
        >
          Find Developers
        </Button>

        {account && (
          <>
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ mr: 2 }}
            >
              <Badge 
                color="error" 
                variant="dot" 
                invisible={!activeSession}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Popover
              open={Boolean(notificationAnchor)}
              anchorEl={notificationAnchor}
              onClose={handleNotificationClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {activeSession ? (
                <Box sx={{ p: 2, minWidth: 300 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Active Video Call
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<VideocamIcon />}
                    onClick={handleJoinCall}
                    fullWidth
                  >
                    Join Call
                  </Button>
                </Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  <Typography color="text.secondary">
                    No active notifications
                  </Typography>
                </Box>
              )}
            </Popover>

            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {account.substring(2, 4)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem sx={{ color: 'text.secondary', pointerEvents: 'none' }}>
                <Typography variant="body2" noWrap>
                  {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfile}>Dashboard</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/onboarding'); }}>
                Developer Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                Disconnect Wallet
              </MenuItem>
            </Menu>
          </>
        )}

        {!account && (
          <Button 
            color="inherit"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 