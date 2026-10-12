import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import wsService from '../services/websocket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [incomingNotification, setIncomingNotification] = useState(null);
  const messageListeners = useRef(new Set());

  useEffect(() => {
    if (!token || !user) {
      wsService.disconnect();
      setConnected(false);
      return;
    }

    wsService.connect(
      token,
      () => {
        setConnected(true);

        // 1. Subscribe to private messages queue
        wsService.subscribe('/user/queue/messages', (message) => {
          messageListeners.current.forEach((listener) => listener(message));
        });

        // 2. Subscribe to private notifications queue (requests, bookings, acceptances)
        wsService.subscribe('/user/queue/notifications', (notification) => {
          setIncomingNotification(notification);
          setTimeout(() => {
            setIncomingNotification(null);
          }, 6000);
        });
      },
      (error) => {
        console.error('Socket connection error', error);
        setConnected(false);
      }
    );

    return () => {
      wsService.disconnect();
      setConnected(false);
    };
  }, [token, user]);

  const addMessageListener = (callback) => {
    messageListeners.current.add(callback);
  };

  const removeMessageListener = (callback) => {
    messageListeners.current.delete(callback);
  };

  return (
    <SocketContext.Provider
      value={{
        connected,
        incomingNotification,
        clearNotification: () => setIncomingNotification(null),
        addMessageListener,
        removeMessageListener,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
