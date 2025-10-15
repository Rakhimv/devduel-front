import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let globalSocket: Socket | null = null;

export const useSocket = (isAuth: boolean) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      if (globalSocket) {
        console.log('Отключение сокета при выходе пользователя');
        globalSocket.disconnect();
        globalSocket = null;
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    if (globalSocket && globalSocket.connected) {
      setSocket(globalSocket);
      setIsConnected(true);
      return;
    }

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:6047', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Ошибка подключения сокета:', error);
      setIsConnected(false);
    });

    globalSocket = newSocket;
    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
    };
  }, [isAuth]);

  return { socket, isConnected };
};

export const disconnectSocket = () => {
  if (globalSocket) {
    console.log('Принудительное отключение сокета');
    globalSocket.disconnect();
    globalSocket = null;
  }
};

