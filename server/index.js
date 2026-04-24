import http from 'node:http';
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.MULTIPLAYER_PORT || 8080);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Slayers multiplayer server running');
});

const wss = new WebSocketServer({ server });

const clients = new Map();
const rooms = new Map();

function randomColor() {
  return Math.floor(Math.random() * 0xffffff);
}

function ensureRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  return rooms.get(roomId);
}

function broadcastRoomSnapshot(roomId) {
  const memberIds = rooms.get(roomId);
  if (!memberIds) return;

  const players = [];
  for (const id of memberIds) {
    const state = clients.get(id);
    if (!state) continue;
    players.push({
      id,
      name: state.name,
      color: state.color,
      position: state.position,
      yaw: state.yaw,
      level: state.level
    });
  }

  const payload = JSON.stringify({ type: 'snapshot', players });
  for (const id of memberIds) {
    const state = clients.get(id);
    if (state?.socket.readyState === 1) state.socket.send(payload);
  }
}

setInterval(() => {
  for (const roomId of rooms.keys()) broadcastRoomSnapshot(roomId);
}, 50);

wss.on('connection', (socket) => {
  const id = crypto.randomUUID();
  const state = {
    id,
    socket,
    name: `Player-${id.slice(0, 4)}`,
    room: 'default',
    color: randomColor(),
    position: { x: 0, y: 2, z: 0 },
    yaw: 0,
    level: 1
  };
  clients.set(id, state);

  socket.send(JSON.stringify({ type: 'welcome', id }));

  socket.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'join') {
      if (state.room) rooms.get(state.room)?.delete(id);
      state.room = (msg.room || 'default').toLowerCase().slice(0, 32);
      state.name = String(msg.name || state.name).slice(0, 24);
      ensureRoom(state.room).add(id);
      broadcastRoomSnapshot(state.room);
      return;
    }

    if (msg.type === 'state') {
      if (msg.position) {
        state.position = {
          x: Number(msg.position.x) || 0,
          y: Number(msg.position.y) || 2,
          z: Number(msg.position.z) || 0
        };
      }
      state.yaw = Number(msg.yaw) || 0;
      state.level = Number(msg.level) || 1;
    }
  });

  socket.on('close', () => {
    rooms.get(state.room)?.delete(id);
    clients.delete(id);
    broadcastRoomSnapshot(state.room);
  });
});

server.listen(PORT, () => {
  console.log(`Multiplayer server listening on :${PORT}`);
});
