import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Button, Box } from '@mui/material';
import { Web3Provider } from './contexts/Web3Context';
import { VideoProvider } from './contexts/VideoContext';
import { DevelopersProvider } from './contexts/DevelopersContext';
import { BookingProvider } from './contexts/BookingContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DevelopersList from './pages/DevelopersList';
import DeveloperProfile from './pages/DeveloperProfile';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import VideoCall from './pages/VideoCall';
import DeveloperOnboarding from './pages/DeveloperOnboarding';
import EditProfile from './pages/EditProfile';
import VideoCallNotification from './components/VideoCallNotification';
import { useVideo } from './contexts/VideoContext';
import './App.css';
import { useEffect } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

// Create ResetButton component
function ResetButton() {
  const { resetAllConnections } = useVideo();
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await resetAllConnections();
      
      // Clear browser cache for the domain
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear IndexedDB
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        window.indexedDB.deleteDatabase(db.name);
      });

      // Navigate to home and reload
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      window.location.reload(); // Fallback to simple reload
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 9999 
      }}
    >
      <Button
        variant="contained"
        color="error"
        onClick={handleReset}
        size="small"
      >
        Reset All Calls
      </Button>
    </Box>
  );
}

// Wrap the app content
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Reset scroll position on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <Navbar />
      <VideoCallNotification />
      <Box component="main" sx={{ 
        flex: 1, 
        pt: 3, 
        pb: 3,
        backgroundColor: 'background.default' 
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/developers" element={<DevelopersList />} />
          <Route path="/developer/:id" element={<DeveloperProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking/:developerId" element={<Booking />} />
          <Route path="/call/:sessionId" element={<VideoCall />} />
          <Route path="/onboarding" element={<DeveloperOnboarding />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </Box>
      <ResetButton />
    </Box>
  );
}

function App() {
  return (
    <Web3Provider>
      <VideoProvider>
        <DevelopersProvider>
          <BookingProvider>
            <NotificationsProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                  <AppContent />
                </Router>
              </ThemeProvider>
            </NotificationsProvider>
          </BookingProvider>
        </DevelopersProvider>
      </VideoProvider>
    </Web3Provider>
  );
}

export default App;
