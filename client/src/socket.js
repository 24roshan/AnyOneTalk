import { io } from "socket.io-client";

const socket = io("https://anyonetalk-1.onrender.com", {
  transports: ["websocket"],
  autoConnect: false,
  reconnection: true,
});

export default socket;
