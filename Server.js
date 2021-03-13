const path = require("path");
const PORT = process.env.PORT || 3000;
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
app.use(express.static(path.join(__dirname, "public")));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

let Players = ["", ""];

io.on("connection", (socket) => {
  let playerIndex = -1;
  for (let i = 0; i < Players.length; i++) {
    if (Players[i] === "") {
      Players[i] = i;
      playerIndex = i;
      break;
    }
  }

  socket.emit("player-number", playerIndex);

  if (playerIndex === -1) return;
  Players[playerIndex] = false;
  socket.broadcast.emit("player-type", playerIndex);

  socket.on("disconnect", () => {
    Players[playerIndex] = "";
    socket.broadcast.emit("player-type", playerIndex);
  });

  socket.on("check", () => {
    const players = [];
    for (let player of Players) {
      if (player === "") {
        players.push({ connected: false, ready: false });
      }
      players.push({ connected: true, ready: player });
    }
    socket.emit("check", players);
  });

  socket.on("playerMove", (i) => {
    io.emit("playerMove", { i, playerIndex });
  });

  socket.on("player-ready", () => {
    socket.broadcast.emit("enemy-ready", playerIndex);
    Players[playerIndex] = true;
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", { playerIndex, msg });
  });

  setTimeout(() => {
    Players[playerIndex] = "";
    socket.emit("timeout");
    socket.disconnect();
  }, 600000);
});
