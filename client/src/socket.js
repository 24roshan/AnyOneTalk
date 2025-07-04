import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
