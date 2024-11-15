import React, { createContext, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { baseApi } from '../App';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socket = io(['http://localhost:3001',baseApi]); // Connect to your server's socket endpoint

  useEffect(() => {
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext); // Custom hook to access socket context
