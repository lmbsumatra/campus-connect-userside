import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const useSocket = (serverUrl) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish socket connection
    socketRef.current = io(serverUrl);

    // Set the socket when it's ready
    setSocket(socketRef.current);

    // Clean up on disconnect
    return () => {
      socketRef.current.disconnect();
    };
  }, [serverUrl]);

  return socket;
};

export default useSocket;
