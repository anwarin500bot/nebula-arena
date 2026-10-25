const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

const players = new Map();
const ARENA = 90;

function spawn() {
  return { x: (Math.random() - .5) * 32, z: (Math.random() - .5) * 32 };
}
function publicPlayers() {
  const out = {};
  for (const [id, p] of players) {
    out[id] = { id, name: p.name, x: p.x, z: p.z, yaw: p.yaw, color: p.color, pings: p.pings };
  }
  return out;
}

io.on("connection", socket => {
  const pos = spawn();
  players.set(socket.id, {
    name: "Explorador", x: pos.x, z: pos.z, yaw: 0, pings: 0,
    color: ["#43e8d8", "#ff6b6b", "#ffd166", "#b388ff", "#7ee081"][Math.floor(Math.random()*5)]
  });
  socket.emit("welcome", { id: socket.id, players: publicPlayers() });
  socket.broadcast.emit("joined", publicPlayers()[socket.id]);

  socket.on("name", value => {
    const p = players.get(socket.id);
    if (p && typeof value === "string") {
      p.name = value.trim().slice(0, 16) || "Explorador";
      io.emit("state", publicPlayers());
    }
  });

  socket.on("move", data => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    p.x = Math.max(-ARENA/2 + 2, Math.min(ARENA/2 - 2, Number(data.x) || 0));
    p.z = Math.max(-ARENA/2 + 2, Math.min(ARENA/2 - 2, Number(data.z) || 0));
    p.yaw = Number(data.yaw) || 0;
  });

  socket.on("ping", () => {
    const p = players.get(socket.id);
    if (!p) return;
    p.pings += 1;
    io.emit("ping", { id: socket.id, x: p.x, z: p.z, count: p.pings });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("left", socket.id);
  });
});

setInterval(() => io.emit("state", publicPlayers()), 50);
server.listen(PORT, "0.0.0.0", () => console.log(`Nebula Arena disponible en el puerto ${PORT}`));
