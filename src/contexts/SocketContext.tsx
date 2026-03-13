import {useEffect, useState, type ReactNode} from "react";
import {Socket} from "socket.io-client";
import {socketService} from "@/services/socket";
import {SocketContext} from "./socket-ctx";

export const SocketProvider = ({children}: {children: ReactNode}) => {
  const [socket] = useState<Socket | null>(() => socketService.connect());
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    if (!socket) return;

    function onConnect() {
      console.log("Socket connected");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Socket disconnected");
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socketService.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={{socket, isConnected}}>{children}</SocketContext.Provider>;
};
