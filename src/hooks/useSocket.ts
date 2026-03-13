import {useEffect, useRef} from "react";
import {useSocketContext} from "@/contexts/socket-ctx";

export const useSocketListener = <T = unknown>(eventName: string, callback: (data: T) => void) => {
  const {socket} = useSocketContext();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!socket) return;

    const handler = (data: T) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName]);

  return socket;
};

export const useSocketEmitter = () => {
  const {socket} = useSocketContext();

  const emit = <T = unknown>(eventName: string, data?: T) => {
    if (socket) {
      socket.emit(eventName, data);
    } else {
      console.warn("Socket not connected, cannot emit event:", eventName);
    }
  };

  return {emit};
};
