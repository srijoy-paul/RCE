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

const app = express();
app.use(cors());
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
console.log(shell, os.platform());
console.log(process.env.INIT_CWD);

const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD + "/user",
  env: process.env,
});

//  console.log(ptyProcess);

chokidar.watch("./user").on("all", (event: any, path: any) => {
  io.emit("file:refresh", path);
});

ptyProcess.onData((data: any) => {
  io.emit("terminal:response", data);
});

io.on("connection", (socket: any) => {
  console.log(`Socket connected ${socket.id}`);

  socket.on("terminal:write", (data: any) => {
    ptyProcess.write(data);
  });

  socket.on("file:save", ({ path, code }: any) => {
    // console.log(path, code);

    fs.writeFile(`./user${path}`, code);
  });
  // socket.on("file:fetch", async (path: any) => {
  //   console.log("received path to fetch", path);
  //   const fileContent = await fs.readFile(`./user${path}`, "utf8");
  //   console.log(fileContent);
  // });
});

app.get("/files", async (req: any, res: any) => {
  const fileTree = await generateFileTree("./user");
  res.json(fileTree);
});

app.get("/files/content", async (req: any, res: any) => {
  const { path } = req.query;
  const fileContent = await fs.readFile(`./user${path}`, "utf8");
  console.log("fetchd content", fileContent);
  res.status(201).json({ fileContent: fileContent });
});

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
