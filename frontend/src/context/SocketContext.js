import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import io from "socket.io-client";
import { baseApi } from "../utils/consonants";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    console.log("Initializing socket connection to:", baseApi);

    const initializeSocket = () => {
      if (reconnectAttemptRef.current >= maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        return;
      }

      const newSocket = io(baseApi, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        reconnectAttemptRef.current = 0;
        setSocket(newSocket);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        reconnectAttemptRef.current++;

        // Attempt to reconnect manually if still within max attempts
        if (reconnectAttemptRef.current < maxReconnectAttempts) {
          console.log(
            `Reconnection attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts}`
          );
          setTimeout(() => {
            if (socketRef.current) {
              socketRef.current.disconnect();
            }
            initializeSocket();
          }, 2000 * reconnectAttemptRef.current); // Exponential backoff
        }
      });
    };

    initializeSocket();

    return () => {
      console.log("Cleaning up socket...");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
