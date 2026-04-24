import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import { PlayerController } from './PlayerController.js';
import { MapManager } from './MapManager.js';
import { UIManager } from './UIManager.js';
import { InteractionSystem } from './InteractionSystem.js';
import { ProgressionSystem } from './ProgressionSystem.js';
import { QuestSystem } from './QuestSystem.js';
import { AudioManager } from './AudioManager.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7fa1bf);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 250);

const ui = new UIManager();
const audio = new AudioManager();
const map = new MapManager(scene);
map.init();

const player = new PlayerController(camera, scene);
const progression = new ProgressionSystem(ui);
const quests = new QuestSystem(ui);
const interaction = new InteractionSystem(camera, scene, map.interactables, (item) => {
  ui.showPanel(item.name, item.description);
  setTimeout(() => ui.hidePanel(), 2200);
  progression.discover(item);
  quests.onDiscover(item);
}, audio);

const minimap = document.querySelector('#minimap');
const miniCtx = minimap.getContext('2d');
let showMinimap = false;
let showJournal = false;
let showRain = false;
let night = false;

const settingsModal = document.querySelector('#settings-modal');
const adminModal = document.querySelector('#admin-modal');
const adminControls = document.querySelector('#admin-controls');

const sensitivityRange = document.querySelector('#sensitivity-range');
const volumeRange = document.querySelector('#volume-range');
const shadowsToggle = document.querySelector('#shadows-toggle');
const fpsToggle = document.querySelector('#fps-toggle');
const speedRange = document.querySelector('#speed-range');
const noclipToggle = document.querySelector('#noclip-toggle');
const dayNightToggle = document.querySelector('#daynight-toggle');
const teleportSelect = document.querySelector('#teleport-select');

map.teleports.forEach((t, i) => {
  const o = document.createElement('option');
  o.value = String(i);
  o.textContent = t.label;
  teleportSelect.append(o);
});

document.querySelector('#teleport-btn').onclick = () => {
  const t = map.teleports[Number(teleportSelect.value)];
  if (t) player.body.position.copy(t.position);
};

document.querySelector('#admin-auth').onclick = () => {
  const ok = document.querySelector('#admin-password').value === 'Slayers';
  if (ok) {
    adminControls.classList.remove('hidden');
    audio.click();
  }
};
document.querySelector('#admin-close').onclick = () => adminModal.classList.add('hidden');
document.querySelector('#settings-close').onclick = () => settingsModal.classList.add('hidden');

sensitivityRange.oninput = () => player.setSensitivity(Number(sensitivityRange.value));
volumeRange.oninput = () => audio.setVolume(Number(volumeRange.value));
shadowsToggle.onchange = () => map.setShadows(shadowsToggle.checked);
fpsToggle.onchange = () => ui.setFpsVisible(fpsToggle.checked);
speedRange.oninput = () => player.setSpeed(Number(speedRange.value));
noclipToggle.onchange = () => (player.noclip = noclipToggle.checked);
dayNightToggle.onchange = () => {
  night = dayNightToggle.checked;
  map.toggleNight(night);
};

document.body.addEventListener('click', () => {
  if (document.pointerLockElement !== document.body) {
    document.body.requestPointerLock();
    ui.hideHelp();
    audio.ensure();
  }
});

addEventListener('keydown', (e) => {
  if (e.code === 'KeyO') settingsModal.classList.toggle('hidden');
  if (e.code === 'KeyP') adminModal.classList.toggle('hidden');
  if (e.code === 'KeyM') {
    showMinimap = !showMinimap;
    minimap.classList.toggle('hidden', !showMinimap);
  }
  if (e.code === 'KeyJ') {
    showJournal = !showJournal;
    ui.showPanel('Journal', progression.journal.length ? progression.journal.join('<br/>') : 'No discoveries yet.');
    if (!showJournal) ui.hidePanel();
  }
  if (e.code === 'KeyR') showRain = !showRain;
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
let fpsS = 0;
let fpsC = 0;
let fpsT = 0;

function drawMinimap() {
  miniCtx.clearRect(0, 0, minimap.width, minimap.height);
  miniCtx.fillStyle = 'rgba(12,20,28,0.85)';
  miniCtx.fillRect(0, 0, minimap.width, minimap.height);
  const scale = 2;
  const cx = minimap.width / 2;
  const cy = minimap.height / 2;
  miniCtx.fillStyle = '#8ed39f';
  map.interactables.forEach((obj) => {
    if (obj.discovered) return;
    miniCtx.fillRect(cx + obj.mesh.position.x * scale - 2, cy + obj.mesh.position.z * scale - 2, 4, 4);
  });
  miniCtx.fillStyle = '#50c2ff';
  miniCtx.beginPath();
  miniCtx.arc(cx + player.body.position.x * scale, cy + player.body.position.z * scale, 4, 0, Math.PI * 2);
  miniCtx.fill();
}

function animate(time) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, clock.getDelta());

  player.update(dt, map.colliders);
  interaction.update();
  map.animate(time);

  if (showRain) {
    scene.fog.density = 0.028;
    if (Math.random() < 0.02) audio.ambientTick();
  } else {
    scene.fog.density += (0.02 - scene.fog.density) * Math.min(1, dt * 2);
  }

  const moving = Math.abs(player.velocity.x) + Math.abs(player.velocity.z) > 1.8 && player.grounded;
  if (moving && time - audio.lastStep > (player.keys.has('ShiftLeft') ? 280 : 430)) {
    audio.lastStep = time;
    audio.footstep();
  }

  if (showMinimap) drawMinimap();
  renderer.render(scene, camera);

  fpsS += 1 / dt;
  fpsC++;
  fpsT += dt;
  if (fpsT > 0.45) {
    ui.setFpsText(fpsS / fpsC);
    fpsS = 0;
    fpsC = 0;
    fpsT = 0;
  }
}
animate(0);
