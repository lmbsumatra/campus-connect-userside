import { io } from "socket.io-client";
import { baseApi } from "../utils/consonants";

const socket = io(`${baseApi}`);

export default socket;
