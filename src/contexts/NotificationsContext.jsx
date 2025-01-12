import { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    setCurrentNotification(newNotification);
    setOpenSnackbar(true);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markAsRead }}>
      {children}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {currentNotification && (
          <Alert
            onClose={handleCloseSnackbar}
            severity={currentNotification.type || 'info'}
            sx={{ width: '100%' }}
            action={
              currentNotification.action
            }
          >
            {currentNotification.message}
          </Alert>
        )}
      </Snackbar>
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext); 