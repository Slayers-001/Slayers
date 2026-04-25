import * as THREE from 'three';
import { PlayerController } from './PlayerController.js';
import { MapManager } from './MapManager.js';
import { UIManager } from './UIManager.js';
import { InteractionSystem } from './InteractionSystem.js';
import { ProgressionSystem } from './ProgressionSystem.js';
import { QuestSystem } from './QuestSystem.js';
import { AudioManager } from './AudioManager.js';
import { SaveSystem } from './SaveSystem.js';
import { WeatherSystem } from './WeatherSystem.js';
import { NPCDialogueSystem } from './NPCDialogueSystem.js';
import { MultiplayerClient } from './MultiplayerClient.js';

const save = new SaveSystem();
const saved = save.merge({
  settings: { sensitivity: 0.0022, volume: 0.5, shadows: true, fps: false },
  progression: null,
  quests: null,
  flags: { rainMode: false, nightMode: false }
});

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 280);

const ui = new UIManager();
const audio = new AudioManager();
const map = new MapManager(scene);
map.init();

const player = new PlayerController(camera, document.body);
scene.add(player.object);

const progression = new ProgressionSystem(ui, saved.progression);
const quests = new QuestSystem(ui, saved.quests, Math.min(12, map.collectibleCount));

let journalOpen = false;
let minimapOpen = false;
let rainMode = saved.flags.rainMode;
let nightMode = saved.flags.nightMode;

const weather = new WeatherSystem(scene);
weather.init();
weather.toggle(rainMode);
map.setNight(nightMode);

const minimapCanvas = document.querySelector('#minimap');
const mini = minimapCanvas.getContext('2d');
const npcDialog = new NPCDialogueSystem((m) => ui.toastMessage(m), document.querySelector('#info-panel'));
const multiplayer = new MultiplayerClient(scene, ui);

for (const item of map.interactables) {
  if (progression.discoveredIds.has(item.name)) item.discovered = true;
}
ui.setDiscoveryCount(progression.discoveredIds.size, map.collectibleCount);

const interaction = new InteractionSystem(
  camera,
  map.interactables,
  (item) => {
    if (item.type === 'npc') {
      npcDialog.talk();
      quests.onInteract(item);
      queueSave();
      return;
    }

    const isNew = progression.registerDiscovery(item);
    item.wasKnown = !isNew;
    if (isNew) {
      item.discovered = true;
      ui.showInfo(item.name, item.description, item.rarity);
      ui.setDiscoveryCount(progression.discoveredIds.size, map.collectibleCount);
      queueSave();
    } else {
      ui.toastMessage(`ℹ️ ${item.name} already recorded.`);
    }

    quests.onInteract(item);
  },
  (item) => {
    if (!item) {
      ui.hideInfo();
      return;
    }
    if (item.type === 'npc') ui.showInfo(item.name, 'Press E to talk with the guide.');
    else ui.showInfo(item.name, item.description, item.rarity);
  },
  audio
);

setupUiControls();
initBoot();
applySavedSettings();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
let fpsAccum = 0;
let fpsCount = 0;
let fpsWindow = 0;
let saveTimer = 0;
let networkTick = 0;

function loop(time) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.033, clock.getDelta());

  player.update(dt, map.colliders);
  map.update(time, rainMode);
  weather.update(dt);
  interaction.update();
  multiplayer.update(dt);

  networkTick += dt;
  if (networkTick > 0.05) {
    networkTick = 0;
    multiplayer.sendState(player, progression);
  }

  ui.setCompass(player.yaw);
  ui.setOnlineCount(multiplayer.remotePlayers.size + (multiplayer.connected ? 1 : 0));

  if (rainMode) {
    scene.fog.density += (0.028 - scene.fog.density) * Math.min(1, dt * 2.5);
    if (Math.random() < 0.015) audio.ambient();
  } else {
    scene.fog.density += (0.016 - scene.fog.density) * Math.min(1, dt * 2.5);
  }

  const moving = player.grounded && Math.hypot(player.velocity.x, player.velocity.z) > 1.7;
  const stepDelay = (player.keys.has('ShiftLeft') || player.keys.has('ShiftRight')) ? 250 : 410;
  if (moving && time - audio.lastStep > stepDelay) {
    audio.lastStep = time;
    audio.step();
  }
  if (player.landingImpact > 0.95) audio.land();

  if (minimapOpen) drawMinimap();
  renderer.render(scene, camera);

  fpsAccum += 1 / dt;
  fpsCount += 1;
  fpsWindow += dt;
  if (fpsWindow > 0.4) {
    ui.setFps(fpsAccum / fpsCount);
    fpsAccum = 0;
    fpsCount = 0;
    fpsWindow = 0;
  }

  if (saveTimer > 0) {
    saveTimer -= dt;
    if (saveTimer <= 0) persist();
  }
}
requestAnimationFrame(loop);

function initBoot() {
  const start = document.querySelector('#start-btn');
  const nameInput = document.querySelector('#player-name');
  const roomInput = document.querySelector('#room-code');

  start.addEventListener('click', () => {
    ui.hideBootOverlay();
    document.body.requestPointerLock();
    audio.init();

    const wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:8080`;
    multiplayer.connect({
      name: nameInput.value.trim() || `Slayer-${Math.floor(Math.random() * 999)}`,
      room: roomInput.value.trim() || 'default',
      wsUrl
    });
  });

  document.body.addEventListener('click', () => {
    if (!document.querySelector('#boot-overlay').classList.contains('hidden')) return;
    if (document.pointerLockElement !== document.body) document.body.requestPointerLock();
  });
}

function setupUiControls() {
  const settings = document.querySelector('#settings-modal');
  const admin = document.querySelector('#admin-modal');

  const sensitivity = document.querySelector('#sensitivity');
  const volume = document.querySelector('#volume');
  const toggleShadows = document.querySelector('#toggle-shadows');
  const toggleFps = document.querySelector('#toggle-fps');

  sensitivity.value = String(saved.settings.sensitivity);
  volume.value = String(saved.settings.volume);
  toggleShadows.checked = Boolean(saved.settings.shadows);
  toggleFps.checked = Boolean(saved.settings.fps);

  sensitivity.addEventListener('input', () => { player.setSensitivity(Number(sensitivity.value)); queueSave(); });
  volume.addEventListener('input', () => { audio.setVolume(Number(volume.value)); queueSave(); });
  toggleShadows.addEventListener('change', () => { map.setShadows(toggleShadows.checked); queueSave(); });
  toggleFps.addEventListener('change', () => { ui.setFpsVisible(toggleFps.checked); queueSave(); });

  document.querySelector('#close-settings').onclick = () => settings.classList.add('hidden');

  const teleportSelect = document.querySelector('#admin-teleport');
  map.teleports.forEach((entry, idx) => {
    const option = document.createElement('option');
    option.value = String(idx);
    option.textContent = entry.label;
    teleportSelect.append(option);
  });

  document.querySelector('#admin-unlock').onclick = () => {
    if (document.querySelector('#admin-pass').value === 'Slayers') {
      document.querySelector('#admin-controls').classList.remove('hidden');
      ui.toastMessage('✅ Admin unlocked');
      audio.uiClick();
    } else {
      ui.toastMessage('❌ Invalid admin password');
    }
  };

  document.querySelector('#close-admin').onclick = () => admin.classList.add('hidden');
  document.querySelector('#noclip').onchange = (e) => (player.noclip = e.target.checked);
  document.querySelector('#admin-speed').oninput = (e) => player.setSpeed(Number(e.target.value));
  document.querySelector('#admin-go').onclick = () => {
    const target = map.teleports[Number(teleportSelect.value)];
    if (!target) return;
    player.object.position.copy(target.point);
    ui.toastMessage(`🧭 Teleported to ${target.label}`);
  };
  document.querySelector('#toggle-night').onchange = (e) => {
    nightMode = e.target.checked;
    map.setNight(nightMode);
    queueSave();
  };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyO') settings.classList.toggle('hidden');
    if (e.code === 'KeyP') admin.classList.toggle('hidden');
    if (e.code === 'KeyM') {
      minimapOpen = !minimapOpen;
      minimapCanvas.classList.toggle('hidden', !minimapOpen);
    }
    if (e.code === 'KeyJ') {
      journalOpen = !journalOpen;
      if (journalOpen) ui.showJournal(progression.journalEntries);
      else ui.hideJournal();
    }
    if (e.code === 'KeyR') {
      rainMode = !rainMode;
      weather.toggle(rainMode);
      ui.toastMessage(rainMode ? '🌧️ Light rain enabled' : '☀️ Rain cleared');
      queueSave();
    }
  });
}

function applySavedSettings() {
  player.setSensitivity(saved.settings.sensitivity);
  audio.setVolume(saved.settings.volume);
  map.setShadows(Boolean(saved.settings.shadows));
  ui.setFpsVisible(Boolean(saved.settings.fps));
}

function queueSave() {
  saveTimer = 0.8;
}

function persist() {
  save.save({
    settings: {
      sensitivity: player.mouseSensitivity,
      volume: audio.master,
      shadows: map.sun.castShadow,
      fps: !document.querySelector('#fps').classList.contains('hidden')
    },
    progression: progression.serialize(),
    quests: quests.serialize(),
    flags: { rainMode, nightMode }
  });
  ui.showSaved();
}

function drawMinimap() {
  const width = minimapCanvas.width;
  const height = minimapCanvas.height;
  mini.clearRect(0, 0, width, height);

  mini.fillStyle = 'rgba(8,16,24,0.92)';
  mini.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 2;

  mini.strokeStyle = '#355268';
  mini.strokeRect(24, 24, width - 48, height - 48);

  for (const item of map.interactables) {
    if (item.discovered) continue;
    mini.fillStyle = item.type === 'npc' ? '#ffd27f' : '#8be198';
    mini.fillRect(centerX + item.mesh.position.x * scale - 2, centerY + item.mesh.position.z * scale - 2, 4, 4);
  }

  mini.fillStyle = '#4bc2ff';
  mini.beginPath();
  mini.arc(centerX + player.object.position.x * scale, centerY + player.object.position.z * scale, 4.5, 0, Math.PI * 2);
  mini.fill();
}
