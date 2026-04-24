import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

export class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactables = [];
    this.teleports = [];
  }

  init() {
    const hemi = new THREE.HemisphereLight(0xaed6ff, 0x1b2128, 0.52);
    this.scene.add(hemi);

    this.sun = new THREE.DirectionalLight(0xfff0d1, 1.05);
    this.sun.position.set(9, 24, 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.radius = 5;
    this.sun.shadow.bias = -0.00008;
    this.sun.shadow.camera.left = -45;
    this.sun.shadow.camera.right = 45;
    this.sun.shadow.camera.top = 45;
    this.sun.shadow.camera.bottom = -45;
    this.scene.add(this.sun);

    this.scene.fog = new THREE.FogExp2(0x8ea6b4, 0.02);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0x4f745b, roughness: 0.92, metalness: 0.03 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(-60, -1, -60), new THREE.Vector3(60, 0, 60)));

    const museum = this._buildArea({ name: 'Museum Hall', pos: [0, 0, -18], color: 0x8a8c92 });
    const park = this._buildArea({ name: 'Park', pos: [16, 0, 10], color: 0x607a5f });
    this.teleports = [
      { label: 'Spawn', position: new THREE.Vector3(0, 2.6, 8) },
      { label: 'Museum Hall', position: museum.center.clone().setY(2.6) },
      { label: 'Park', position: park.center.clone().setY(2.6) }
    ];

    this._spawnDiscoveries(museum, park);
    this._spawnParticles();
  }

  _buildArea({ name, pos, color }) {
    const base = new THREE.Group();
    base.position.set(...pos);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 12), mat);
    ground.position.y = 0.2;
    ground.receiveShadow = true;
    base.add(ground);
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(base.position.clone().add(new THREE.Vector3(0, 0.2, 0)), new THREE.Vector3(12, 0.4, 12)));

    for (let i = -1; i <= 1; i += 2) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 12), mat);
      wall.position.set(i * 6, 2.2, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      base.add(wall);
      this.colliders.push(new THREE.Box3().setFromObject(wall).translate(base.position));
    }

    this.scene.add(base);
    return { name, center: base.position.clone(), group: base };
  }

  _spawnDiscoveries(...areas) {
    const info = ['Ancient statue', 'Interactive globe', 'Garden herb', 'Hidden rune', 'Archive tablet', 'Fountain emblem'];
    areas.forEach((area, ai) => {
      for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.45, 1),
          new THREE.MeshStandardMaterial({ color: ai ? 0x89db90 : 0x89a8db, emissive: 0x111111, roughness: 0.4 })
        );
        mesh.position.copy(area.center).add(new THREE.Vector3((i - 1) * 2.5, 1.2, ai ? -i : i * 1.7));
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.interactables.push({
          mesh,
          name: info[ai * 3 + i],
          description: `Discovery logged: ${info[ai * 3 + i]} in ${area.name}.`,
          area: area.name,
          discovered: false
        });
        this.colliders.push(new THREE.Box3().setFromObject(mesh));
      }
    });
  }

  _spawnParticles() {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 6 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: 0.06, color: 0xd8cab6, transparent: true, opacity: 0.58 })
    );
    this.scene.add(this.particles);
  }

  animate(time) {
    if (!this.particles) return;
    const arr = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] += Math.sin(time * 0.0004 + arr[i + 2]) * 0.0008;
      arr[i + 2] += Math.cos(time * 0.0003 + arr[i]) * 0.0008;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  toggleNight(on) {
    this.sun.intensity = on ? 0.25 : 1.05;
    this.scene.fog.color.set(on ? 0x24334b : 0x8ea6b4);
    this.scene.background = new THREE.Color(on ? 0x060d1c : 0x7fa1bf);
  }

  setShadows(enabled) {
    this.sun.castShadow = enabled;
  }
}
