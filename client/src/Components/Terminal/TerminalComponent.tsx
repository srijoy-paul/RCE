import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect } from "react";
function TerminalComponent() {
  useEffect(() => {
    const terminalElement = document.getElementById("terminal");
    const term = new Terminal({
      cursorBlink: true,
    });
    term.open(terminalElement);
    term.write("Srijoy $");

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
