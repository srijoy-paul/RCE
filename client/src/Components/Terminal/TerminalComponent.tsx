import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect } from "react";
import socket from "../../Sockets";

function TerminalComponent() {
  useEffect(() => {
    const terminalElement = document.getElementById("terminal");
    const term = new Terminal({
      cursorBlink: true,
      rows: 15,
    });
    if (!terminalElement) return;
    term.open(terminalElement);
    term.write("Srijoy-pc bash$");

    term.onData((data) => {
      socket.emit("terminal:write", data);
    });
    socket.on("terminal:response", (data) => {
      term.write(data);
    });

    return () => {
      term.dispose();
    };
  }, []);
  return (
    <div>
      <div id="terminal" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}

export default TerminalComponent;