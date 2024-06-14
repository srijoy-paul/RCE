import { IPty } from "node-pty";
const os = require("os");
const { fork } = require("node-pty");
const path = require("path");

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

class TerminalManager {
  private sessions: { [id: string]: { terminal: IPty; replId: string } } = {};
  constructor() {
    this.sessions = {};
  }

  createPty(
    id: string,
    replId: string,
    onData: (data: string, id: number) => void
  ) {
    let term = fork(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: process.env.INIT_CWD + "/user",
      env: process.env,
    });

    term.on("data", (data: string) => onData(data, term.pid));
    this.sessions[id] = { terminal: term, replId };

    term.on("exit", () => {
      delete this.sessions[id];
    });
    return term;
  }

  write(terminalId: number, data: string) {
    this.sessions[terminalId]?.terminal.write(data);
  }

  clear(terminalId: number) {
    if (this.sessions[terminalId]) {
      this.sessions[terminalId].terminal.kill();
      delete this.sessions[terminalId];
    }
  }
}

module.exports = TerminalManager;
export {};
