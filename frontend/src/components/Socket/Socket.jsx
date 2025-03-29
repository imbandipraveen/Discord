import { useEffect } from 'react';
import socketIO from 'socket.io-client';

const url = import.meta.env.VITE_API_URL;
let socket = socketIO.connect(url);

export default socket; 