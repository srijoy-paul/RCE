const { fetchS3Folder, saveToS3 } = require("./config/aws");
const os = require("os");
const express = require("express");
const { createServer } = require("http");
const { Server: SocketServer } = require("socket.io");
const pty = require("node-pty");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const chokidar = require("chokidar");
require("dotenv").config();
const TerminalManager = require("./utils/manageTerminal");
const projectRoutes = require("./Routes/ProjectRoutes");

const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
// console.log(shell, os.platform());
// console.log(process.env.INIT_CWD);

// const ptyProcess = pty.spawn(shell, [], {
//   name: "xterm-color",
//   cols: 80,
//   rows: 30,
//   cwd: process.env.INIT_CWD + "/user",
//   env: process.env,
// });

const terminalManager = new TerminalManager();

chokidar.watch("./user").on("all", (event: any, path: any) => {
  io.emit("file:refresh", path);
});

// ptyProcess.onData((data: any) => {
//   io.emit("terminal:response", data);
// });

io.on("connection", (socket: any) => {
  // console.log(`Socket connected ${socket.id}`);
  const replId = socket.handshake.query.roomId as string;
  console.log("Socket id", replId);

  // if (!replId) {
  //   socket.disconnect();
  //   return;
  // }

  // if (replId) {
  //   socket.join(replId);
  //   console.log(`repl created`);
  // }

  terminalManager.createPty(socket.id, replId, (data: string, id: number) => {
    socket.emit("terminal:response", data);
  });

  socket.on("terminal:write", (data: any) => {
    terminalManager.write(socket.id, data);
  });

  socket.on("file:save", async ({ filePath, code }: any) => {
    // console.log(filePath, code);
    const fullPath = path.join(__dirname, `user/${filePath}`);

    fs.writeFile(fullPath, code);
    await saveToS3(`code`, filePath, code);
  });

  socket.on("disconnect", () => {
    terminalManager.clear(socket.id);
    console.log("User disconnected");
  });

  socket.on("connect_error", (error: Error) => {
    console.error("Connection error:", error);
  });
});

app.get("/files", async (req: any, res: any) => {
  const { replId } = req.query;
  console.log("getfilerequest-->", replId);

  // console.log(path.join(__dirname, `/user/${replId}`));

  await fetchS3Folder(`code/${replId}`, path.join(__dirname, `user/${replId}`));

  const fileTree = await generateFileTree("./user");
  res.json(fileTree);
});

app.get("/files/content", async (req: any, res: any) => {
  const { path } = req.query;
  const fileContent = await fs.readFile(`./user${path}`, "utf8");
  console.log("fetchd content", fileContent);
  res.status(201).json({ fileContent: fileContent });
});

app.use("/api/v1/project", projectRoutes);

const PORT = 3030;
server.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});

async function generateFileTree(directory: any) {
  const tree = {};
  async function buildTree(currentDir: any, currentTree: any) {
    const files = await fs.readdir(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        currentTree[file] = {};
        await buildTree(filePath, currentTree[file]);
      } else {
        currentTree[file] = null;
      }
    }
  }
  await buildTree(directory, tree);
  return tree;
}
