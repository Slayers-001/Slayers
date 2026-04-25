import * as THREE from 'three';

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;
    this.flash = 0;
  }

  init() {
    const count = 1200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 120;
      arr[i * 3 + 1] = Math.random() * 40 + 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    this.rain = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xaad9ff, size: 0.08, transparent: true, opacity: 0.0, depthWrite: false }));
    this.scene.add(this.rain);

    this.lightning = new THREE.DirectionalLight(0xbfdfff, 0);
    this.lightning.position.set(0, 30, 0);
    this.scene.add(this.lightning);
  }

  toggle(v) { this.enabled = v; }

  update(dt) {
    if (!this.rain) return;
    const pos = this.rain.geometry.attributes.position.array;
    const speed = this.enabled ? 25 : 0;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] -= speed * dt;
      if (pos[i + 1] < 0) pos[i + 1] = Math.random() * 35 + 5;
    }
    this.rain.geometry.attributes.position.needsUpdate = true;
    this.rain.material.opacity += ((this.enabled ? 0.5 : 0.0) - this.rain.material.opacity) * Math.min(1, dt * 2.5);

    if (this.enabled && Math.random() < 0.003) this.flash = 1;
    this.flash = Math.max(0, this.flash - dt * 2.8);
    this.lightning.intensity = this.flash;
  }
}
