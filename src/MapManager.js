import * as THREE from 'three';

export class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactables = [];
    this.teleports = [];
    this.dynamic = [];
    this.npc = null;
  }

  init() {
    this.scene.background = new THREE.Color(0x8db2cd);
    this.scene.fog = new THREE.FogExp2(0x86a2b1, 0.016);

    const hemi = new THREE.HemisphereLight(0xbcdefa, 0x13202b, 0.52);
    this.sun = new THREE.DirectionalLight(0xfff0d2, 1.0);
    this.sun.position.set(18, 26, 8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.radius = 4.5;
    this.sun.shadow.bias = -0.00006;
    this.sun.shadow.camera.left = -45;
    this.sun.shadow.camera.right = 45;
    this.sun.shadow.camera.top = 45;
    this.sun.shadow.camera.bottom = -45;
    this.scene.add(hemi, this.sun);

    const terrainMat = new THREE.MeshStandardMaterial({ color: 0x577760, roughness: 0.95, metalness: 0.02 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), terrainMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(-80, -2, -80), new THREE.Vector3(80, 0.05, 80)));

    const museum = this.createZone('Museum Hall', new THREE.Vector3(0, 0, -22), 0x8f9296);
    const park = this.createZone('Park Plaza', new THREE.Vector3(20, 0, 14), 0x647f63);

    this.teleports = [
      { label: 'Spawn', point: new THREE.Vector3(0, 2.2, 8) },
      { label: 'Museum', point: museum.clone().setY(2.2) },
      { label: 'Park', point: park.clone().setY(2.2) }
    ];

    this.spawnDiscoveries(museum, park);
    this.spawnDust();
    this.spawnNpcGuide(new THREE.Vector3(-6, 1.2, -10));
  }

  createZone(name, center, color) {
    const zone = new THREE.Group();
    zone.position.copy(center);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.1 });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 14), mat);
    platform.position.y = 0.25;
    platform.receiveShadow = true;
    zone.add(platform);
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(center.clone().add(new THREE.Vector3(0, 0.25, 0)), new THREE.Vector3(14, 0.5, 14)));

    for (let i = -1; i <= 1; i += 2) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4, 14), mat);
      wall.position.set(i * 7, 2.25, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      zone.add(wall);
    }

    const sign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1, 0.2), new THREE.MeshStandardMaterial({ color: 0x243849, roughness: 0.4 }));
    sign.position.set(0, 2.5, -6.5);
    zone.add(sign);

    this.scene.add(zone);
    for (const child of zone.children) {
      if (child.geometry) this.colliders.push(new THREE.Box3().setFromObject(child).translate(center));
    }
    return center;
  }

  spawnDiscoveries(museum, park) {
    const discoveries = [
      ['Ancient Statue', museum.clone().add(new THREE.Vector3(-2.3, 1.1, 2.4)), 'A weathered guardian from a lost dynasty.'],
      ['Archive Tablet', museum.clone().add(new THREE.Vector3(2.4, 1.1, 1.7)), 'Stone panel describing forgotten routes.'],
      ['Interactive Globe', museum.clone().add(new THREE.Vector3(0.1, 1.1, -2.6)), 'A rotating globe with hidden stars.'],
      ['Garden Herb', park.clone().add(new THREE.Vector3(-2.1, 1.1, 2.1)), 'Rare healing herb rooted near old waterlines.'],
      ['Fountain Emblem', park.clone().add(new THREE.Vector3(2.2, 1.1, 0.4)), 'A crest tied to ancient slayer guilds.'],
      ['Hidden Rune', park.clone().add(new THREE.Vector3(0.2, 1.1, -2.2)), 'A rune shimmering softly in twilight.']
    ];

    discoveries.forEach(([name, position, description], i) => {
      const hue = i < 3 ? 0x8db7ff : 0x8ef2a2;
      const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), new THREE.MeshStandardMaterial({ color: hue, emissive: 0x161616, roughness: 0.35, metalness: 0.35 }));
      mesh.position.copy(position);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.interactables.push({ mesh, name, description, area: i < 3 ? 'Museum Hall' : 'Park Plaza', discovered: false, type: 'discovery' });
      this.dynamic.push({ mesh, speed: 0.6 + Math.random() * 0.4, phase: Math.random() * Math.PI });
    });

    const egg = new THREE.Mesh(new THREE.TorusKnotGeometry(0.4, 0.12, 100, 16), new THREE.MeshStandardMaterial({ color: 0xff98dd, emissive: 0x240822 }));
    egg.position.set(-14, 1.8, 18);
    egg.castShadow = true;
    this.scene.add(egg);
    this.interactables.push({ mesh: egg, name: 'Developer Easter Egg', description: 'You found a hidden relic with a playful signature.', area: 'Wilds', discovered: false, type: 'easter_egg' });
    this.dynamic.push({ mesh: egg, speed: 1.3, phase: 0 });
  }

  spawnNpcGuide(position) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.7, 4, 8), new THREE.MeshStandardMaterial({ color: 0xd6bc83 }));
    body.position.copy(position);
    body.castShadow = true;
    this.scene.add(body);
    this.npc = body;
    this.interactables.push({ mesh: body, name: 'Guide NPC', description: 'Guide: Recover discoveries and watch your quest tracker.', area: 'Hub', discovered: false, type: 'npc' });
  }

  spawnDust() {
    const count = 450;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 8 + 0.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xdbc9af, size: 0.08, opacity: 0.52, transparent: true, depthWrite: false }));
    this.scene.add(this.dust);
  }

  update(time, rainy = false) {
    for (const item of this.dynamic) {
      item.mesh.rotation.y += 0.004 * item.speed;
      item.mesh.position.y += Math.sin(time * 0.0008 * item.speed + item.phase) * 0.003;
    }

    if (this.npc) this.npc.rotation.y = Math.sin(time * 0.0014) * 0.4;

    if (this.dust) {
      const array = this.dust.geometry.attributes.position.array;
      for (let i = 0; i < array.length; i += 3) {
        array[i] += Math.sin(time * 0.00035 + array[i + 2]) * 0.00055;
        array[i + 2] += Math.cos(time * 0.00026 + array[i]) * 0.00055;
      }
      this.dust.geometry.attributes.position.needsUpdate = true;
      this.dust.material.opacity = rainy ? 0.3 : 0.52;
    }
  }

  setNight(enabled) {
    this.sun.intensity = enabled ? 0.23 : 1.0;
    this.scene.background = new THREE.Color(enabled ? 0x081326 : 0x8db2cd);
    this.scene.fog.color.set(enabled ? 0x2f3f5e : 0x86a2b1);
  }

  setShadows(enabled) {
    this.sun.castShadow = enabled;
  }
}
