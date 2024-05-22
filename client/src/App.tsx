import { useState } from "react";
import "./App.css";
import TerminalComponent from "./Components/Terminal/TerminalComponent";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-col w-full h-screen border-4 border-red-300">
        <div className="flex border-2 border-green-300" style={{ flex: "4" }}>
          <div style={{ flex: "1" }}>Files</div>
          <div style={{ flex: "5" }}>Code</div>
        </div>
        <div
          className="border-2 border-pink-300"
          style={{ flex: "1" }}
          id="xterm-container"
        >
          <TerminalComponent />
        </div>
      </div>
    </>
  );
}

export default App;
