import * as THREE from 'three';

export class MultiplayerClient {
  constructor(scene, ui) {
    this.scene = scene;
    this.ui = ui;
    this.socket = null;
    this.localId = null;
    this.remotePlayers = new Map();
    this.connected = false;
    this.room = 'default';
    this.name = `Slayer-${Math.floor(Math.random() * 900 + 100)}`;
  }

  connect({ name, room, wsUrl }) {
    this.name = name || this.name;
    this.room = room || this.room;
    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener('open', () => {
      this.connected = true;
      this.ui.toastMessage('🌐 Multiplayer connected');
      this.send({ type: 'join', name: this.name, room: this.room });
    });

    this.socket.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      this.handleMessage(msg);
    });

    this.socket.addEventListener('close', () => {
      this.connected = false;
      this.ui.toastMessage('⚠️ Multiplayer disconnected');
    });

    this.socket.addEventListener('error', () => {
      this.ui.toastMessage('⚠️ Multiplayer connection error');
    });
  }

  handleMessage(msg) {
    if (msg.type === 'welcome') {
      this.localId = msg.id;
      return;
    }

    if (msg.type === 'snapshot') {
      const incoming = new Set();
      for (const player of msg.players) {
        if (player.id === this.localId) continue;
        incoming.add(player.id);
        this.upsertRemotePlayer(player);
      }
      for (const [id, obj] of this.remotePlayers) {
        if (!incoming.has(id)) {
          this.scene.remove(obj.group);
          obj.label.material.map?.dispose();
          obj.label.material.dispose();
          this.remotePlayers.delete(id);
        }
      }
    }
  }

  upsertRemotePlayer(player) {
    let existing = this.remotePlayers.get(player.id);
    if (!existing) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.35, 0.8, 4, 8),
        new THREE.MeshStandardMaterial({ color: player.color || 0x6bd0ff })
      );
      body.castShadow = true;
      group.add(body);

      const label = this.createLabelSprite(player.name || 'Player');
      label.position.set(0, 1.5, 0);
      group.add(label);

      this.scene.add(group);
      existing = { group, targetPosition: new THREE.Vector3(), targetYaw: 0, label };
      this.remotePlayers.set(player.id, existing);
    }

    existing.targetPosition.set(player.position.x, player.position.y, player.position.z);
    existing.targetYaw = player.yaw;
    if (existing.label.userData.text !== player.name) {
      existing.group.remove(existing.label);
      existing.label = this.createLabelSprite(player.name || 'Player');
      existing.label.position.set(0, 1.5, 0);
      existing.group.add(existing.label);
    }
  }

  createLabelSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10,20,30,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#cdefff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2.2, 0.55, 1);
    sprite.userData.text = text;
    return sprite;
  }

  sendState(playerController, progression) {
    if (!this.connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'state',
      position: {
        x: playerController.object.position.x,
        y: playerController.object.position.y,
        z: playerController.object.position.z
      },
      yaw: playerController.yaw,
      level: progression.level
    });
  }

  update(dt) {
    for (const entry of this.remotePlayers.values()) {
      entry.group.position.lerp(entry.targetPosition, Math.min(1, dt * 12));
      entry.group.rotation.y += (entry.targetYaw - entry.group.rotation.y) * Math.min(1, dt * 10);
    }
  }

  send(data) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(data));
  }
}
