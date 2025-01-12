import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('bookings');
    try {
      // Clean up any stale bookings on load
      if (savedBookings) {
        const parsed = JSON.parse(savedBookings);
        const cleaned = parsed.filter(booking => {
          // Keep only recent bookings (last 24 hours)
          const bookingTime = new Date(booking.createdAt).getTime();
          const now = new Date().getTime();
          const isRecent = (now - bookingTime) < 24 * 60 * 60 * 1000;
          
          // Reset any stale active/confirmed sessions
          if (!isRecent && (booking.status === 'active' || booking.status === 'confirmed')) {
            booking.status = 'completed';
          }
          return isRecent;
        });
        return cleaned;
      }
    } catch (error) {
      console.error('Error parsing bookings:', error);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  const createBooking = async (bookingData) => {
    // Complete any existing active/confirmed sessions
    setBookings(prev => prev.map(booking => {
      if (booking.status === 'active' || booking.status === 'confirmed') {
        return { ...booking, status: 'completed' };
      }
      return booking;
    }));

    const newBooking = {
      id: Date.now(), // Use timestamp for unique ID
      status: bookingData.status || 'pending',
      createdAt: new Date().toISOString(),
      paymentMethod: bookingData.paymentMethod || 'real',
      ...bookingData
    };
    
    setBookings(prev => [...prev, newBooking]);
    localStorage.setItem('latestBooking', JSON.stringify(newBooking));
    return newBooking;
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => {
      // If setting a booking to active/confirmed, complete all other active/confirmed sessions
      if (newStatus === 'active' || newStatus === 'confirmed') {
        return prev.map(booking => {
          if (booking.id === bookingId) {
            return { ...booking, status: newStatus };
          }
          if (booking.status === 'active' || booking.status === 'confirmed') {
            return { ...booking, status: 'completed' };
          }
          return booking;
        });
      }
      
      // Otherwise just update the specified booking
      return prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
    });
  };

  const clearAllBookings = () => {
    setBookings([]);
    localStorage.removeItem('bookings');
    localStorage.removeItem('latestBooking');
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      createBooking,
      updateBookingStatus,
      clearAllBookings
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}; 