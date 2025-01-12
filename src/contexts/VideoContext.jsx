import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoContext = createContext();

// Create separate clients for host and audience
const hostClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
const audienceClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

// Your Agora App ID
const AGORA_APP_ID = 'a1f20688a078453baf62a489ca6b0d54';

export function VideoProvider({ children }) {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [joinState, setJoinState] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const cleanup = useCallback(async () => {
    if (isLeaving) return; // Prevent multiple cleanups
    setIsLeaving(true);

    try {
      // Close tracks first
      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      if (localVideoTrack) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }

      // Leave channels if connected
      const leavePromises = [];
      
      if (hostClient.connectionState === 'CONNECTED' || hostClient.connectionState === 'CONNECTING') {
        leavePromises.push(
          hostClient.leave().catch(error => {
            console.error('Error leaving host client:', error);
          })
        );
      }
      
      if (audienceClient.connectionState === 'CONNECTED' || audienceClient.connectionState === 'CONNECTING') {
        leavePromises.push(
          audienceClient.leave().catch(error => {
            console.error('Error leaving audience client:', error);
          })
        );
      }

      await Promise.all(leavePromises);

      setRemoteUsers([]);
      setJoinState(false);
      setActiveSession(null);
      setCurrentClient(null);
    } catch (error) {
      console.error('Cleanup error:', error);
    } finally {
      setIsLeaving(false);
    }
  }, [localAudioTrack, localVideoTrack]);

  // Setup event handlers for a client
  const setupClientEvents = useCallback((client) => {
    const handleUserPublished = async (user, mediaType) => {
      console.log('User published:', user.uid, mediaType); // Debug log
      try {
        await client.subscribe(user, mediaType);
        console.log('Subscribed to:', user.uid, mediaType); // Debug log
        
        setRemoteUsers(prevUsers => {
          // Remove any existing user with the same UID
          const filteredUsers = prevUsers.filter(u => u.uid !== user.uid);
          // Add the user with the new media type
          return [...filteredUsers, user];
        });
      } catch (error) {
        console.error('Subscribe error:', error);
      }
    };

    const handleUserUnpublished = async (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType); // Debug log
      try {
        await client.unsubscribe(user, mediaType);
        setRemoteUsers(prevUsers => {
          return prevUsers.map(u => {
            if (u.uid === user.uid) {
              const newUser = { ...u };
              delete newUser[mediaType];
              return newUser;
            }
            return u;
          });
        });
      } catch (error) {
        console.error('Unsubscribe error:', error);
      }
    };

    const handleUserLeft = (user) => {
      console.log('User left:', user.uid); // Debug log
      setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    const handleConnectionStateChange = (curState, prevState) => {
      if (curState === 'RECONNECTING') {
        setReconnecting(true);
      } else if (curState === 'CONNECTED') {
        setReconnecting(false);
      }
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);
    client.on('connection-state-change', handleConnectionStateChange);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
      client.off('connection-state-change', handleConnectionStateChange);
    };
  }, []);

  // Set up event handlers for both clients
  useEffect(() => {
    const cleanupHost = setupClientEvents(hostClient);
    const cleanupAudience = setupClientEvents(audienceClient);

    return () => {
      cleanupHost();
      cleanupAudience();
    };
  }, [setupClientEvents]);

  const join = async (channelName, token, uid, role = 'host') => {
    if (!channelName) return;
    
    try {
      // If already in a call, clean up first
      if (currentClient || joinState) {
        await cleanup();
        // Wait a bit for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Select the appropriate client based on role
      const client = role === 'host' ? hostClient : audienceClient;

      // Check if client is already connected
      if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
        await client.leave().catch(console.error);
        // Wait a bit after leaving
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setCurrentClient(client);
      
      // Set client role
      await client.setClientRole(role === 'host' ? 'host' : 'audience');
      
      // Generate a unique session ID that includes the channel and role
      const sessionUid = `${role}-${uid}-${Date.now()}`;
      console.log('Joining with UID:', sessionUid); // Debug log
      
      await client.join(AGORA_APP_ID, channelName, token || null, sessionUid);
      
      if (role === 'host') {
        console.log('Creating host tracks...'); // Debug log
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'high_quality',
          AEC: true,
          ANS: true,
          AGC: true
        });
        
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 360,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000,
          },
          optimizationMode: 'detail'
        });
        
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        
        console.log('Publishing host tracks...'); // Debug log
        await client.publish([audioTrack, videoTrack]);
      }
      
      setJoinState(true);
      setActiveSession({ 
        roomName: channelName, 
        uid: sessionUid,
        role
      });
      
    } catch (error) {
      console.error('Error joining channel:', error);
      await cleanup();
      throw error;
    }
  };

  const leave = async () => {
    if (isLeaving) return; // Prevent multiple leave calls
    
    try {
      await cleanup();
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <VideoContext.Provider
      value={{
        client: currentClient,
        localAudioTrack,
        localVideoTrack,
        joinState,
        remoteUsers,
        join,
        leave,
        activeSession,
        reconnecting
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export const useVideo = () => useContext(VideoContext); 