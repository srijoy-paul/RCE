import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
const EXECUTION_ENGINE_URI = import.meta.env.VITE_EXECUTION_ENGINE_URI;

// const initialSocket = io("http://localhost:3030");
function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`${EXECUTION_ENGINE_URI}?roomId=${replId}`, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });
    // console.log(newSocket);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

export default useSocket;
