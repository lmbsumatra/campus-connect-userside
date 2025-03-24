import { io } from "socket.io-client";
import { baseApi } from "../utils/consonants";

const socket = io(`${baseApi}`, {
    withCredentials: true,
    transports: ["websocket", "polling"], // explicitly set both if needed
  });
  

export default socket;
