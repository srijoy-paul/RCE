const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3030;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
