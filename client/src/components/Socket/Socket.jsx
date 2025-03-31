import { useEffect } from "react";
import socketIO from "socket.io-client";
const url = process.env.REACT_APP_URL;
let socket = socketIO.connect("http://localhost:3080");
export default socket;
