import { useEffect, useRef } from "react";
import io from "socket.io-client";

const useSocket = (serverUrl) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Establish socket connection only once
    socketRef.current = io(serverUrl);

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  return socketRef.current;
};

export default useSocket;
