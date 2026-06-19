import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { API_URL } from '../api.js';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext); // Can be user or captain

  useEffect(() => {
    if (user) {
      // Connect to the backend server
      const newSocket = io(API_URL);
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        // Identify the user or captain with their role and ID
        newSocket.emit('identify', { role: user.role || 'user', id: user.id || user._id });
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
