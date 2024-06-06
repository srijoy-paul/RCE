const os=require('os');
const express = require("express");
const {createServer} = require("http");
const {Server:SocketServer}= require("socket.io");
const pty=require('node-pty');
const cors=require('cors');

const app = express();
const server = createServer(app);
const io = new SocketServer(server,{
  cors:{
    origin:'*'
  }
});


const shell=os.platform()==='win32'?'powershell.exe':'bash';
console.log(shell,os.platform());


const ptyProcess=pty.spawn(shell,[],{
  name:'xterm-color',
  cols:80,
  rows:30,
  cwd:process.env.INIT_CWD,
  env:process.env
});

//  console.log(ptyProcess);

ptyProcess.onData((data:any)=>{
  io.emit("terminal:response",data);
})

io.on('connection',(socket:any)=>{
  console.log(`Socket connected ${socket.id}`);
  
  
  socket.on("terminal:write",(data:any)=>{
    ptyProcess.write(data);
  })
});
 

const PORT = 3030;
server.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
