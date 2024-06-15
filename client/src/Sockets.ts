import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { EXECUTION_ENGINE_URI } from "./config";
console.log("from sockets.ts", EXECUTION_ENGINE_URI);

// const initialSocket = io("http://localhost:3030");
function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`${EXECUTION_ENGINE_URI}?roomId=${replId}`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket with ID:", newSocket.id);
    });

    newSocket.on("disconnect", (reason, details) => {
      console.log("Disconnected from WebSocket:", reason);
      console.log("Reason for disconnection low level", details?.message);

      console.log("details.description", details?.description);

      console.log("details.context", details?.context);
      if (reason === "io server disconnect") {
        newSocket.connect();
      } else if (reason === "transport close") {
        console.log("Transport closed. Attempting to reconnect...");
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

export default useSocket;
