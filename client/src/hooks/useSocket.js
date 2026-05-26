import { useEffect, useRef, useState } from 'react';
import socket from '../socket';
import { getRandomUserColor, getRandomUserName } from '../utils/nodePositioning';

/**
 * Hook to manage socket connection and room joining.
 * Creates a persistent user identity (name + color) for the session.
 */
export function useSocket(boardId) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const userRef = useRef({
    name: getRandomUserName(),
    color: getRandomUserColor(),
  });

  useEffect(() => {
    if (!boardId) return;

    // Connect if not already
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
      // Join the board room
      socket.emit('join-board', {
        boardId,
        userName: userRef.current.name,
        userColor: userRef.current.color,
      });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onRoomUsers = (users) => {
      setRoomUsers(users);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room-users', onRoomUsers);

    // If already connected, join immediately
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room-users', onRoomUsers);
    };
  }, [boardId]);

  return {
    socket,
    isConnected,
    roomUsers,
    currentUser: userRef.current,
  };
}
