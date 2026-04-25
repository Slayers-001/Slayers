import * as THREE from 'three';

export class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactables = [];
    this.teleports = [];
    this.dynamic = [];
    this.collectibleCount = 0;
    this.zoneCenters = {};
    this.npc = null;
  }

  init() {
    this.scene.background = new THREE.Color(0x8db2cd);
    this.scene.fog = new THREE.FogExp2(0x88a5b5, 0.015);

    const hemi = new THREE.HemisphereLight(0xc4e4ff, 0x12202d, 0.58);
    this.sun = new THREE.DirectionalLight(0xfff1d5, 1.05);
    this.sun.position.set(20, 30, 12);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.radius = 4.5;
    this.sun.shadow.bias = -0.00005;
    this.sun.shadow.camera.left = -60;
    this.sun.shadow.camera.right = 60;
    this.sun.shadow.camera.top = 60;
    this.sun.shadow.camera.bottom = -60;
    this.scene.add(hemi, this.sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180),
      new THREE.MeshStandardMaterial({ color: 0x597b62, roughness: 0.94, metalness: 0.02 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(-90, -2, -90), new THREE.Vector3(90, 0.06, 90)));

    const museum = this.createZone('Museum Hall', new THREE.Vector3(0, 0, -24), 0x94989f);
    const park = this.createZone('Park Plaza', new THREE.Vector3(24, 0, 14), 0x668364);
    const market = this.createZone('Market Lane', new THREE.Vector3(-24, 0, 18), 0x7d6a59);

    this.zoneCenters = { museum, park, market };
    this.teleports = [
      { label: 'Spawn', point: new THREE.Vector3(0, 2.2, 8) },
      { label: 'Museum', point: museum.clone().setY(2.2) },
      { label: 'Park', point: park.clone().setY(2.2) },
      { label: 'Market', point: market.clone().setY(2.2) }
    ];

    this.buildHubProps();
    this.spawnDiscoveries(museum, park, market);
    this.spawnDust();
    this.spawnNpcGuide(new THREE.Vector3(-5, 1.2, -8));
  }

  createZone(name, center, color) {
    const group = new THREE.Group();
    group.position.copy(center);

    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });
    const platform = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 16), mat);
    platform.position.y = 0.25;
    platform.receiveShadow = true;
    group.add(platform);
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(center.clone().add(new THREE.Vector3(0, 0.25, 0)), new THREE.Vector3(16, 0.5, 16)));

    for (let i = -1; i <= 1; i += 2) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 16), mat);
      wall.position.set(i * 8, 2.35, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      group.add(wall);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          center.clone().add(new THREE.Vector3(i * 8, 2.35, 0)),
          new THREE.Vector3(0.5, 4.2, 16)
        )
      );
    }

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x203749, roughness: 0.45 })
    );
    sign.position.set(0, 2.7, -7.5);
    group.add(sign);

    this.scene.add(group);
    return center;
  }

  buildHubProps() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6b737a, roughness: 0.88 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e5238, roughness: 0.8 });

    // central fountain
    const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.2, 0.9, 24), stoneMat);
    fountainBase.position.set(0, 0.45, 0);
    fountainBase.receiveShadow = true;
    this.scene.add(fountainBase);
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0.45, 0), new THREE.Vector3(8, 1, 8)));

    const fountainCore = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.6, 18), stoneMat);
    fountainCore.position.set(0, 1.8, 0);
    fountainCore.castShadow = true;
    this.scene.add(fountainCore);
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 1.8, 0), new THREE.Vector3(2.8, 2.6, 2.8)));

    // benches around hub
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 10;
      const z = Math.sin(angle) * 10;
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 1), woodMat);
      bench.position.set(x, 0.5, z);
      bench.rotation.y = angle + Math.PI / 2;
      bench.castShadow = true;
      bench.receiveShadow = true;
      this.scene.add(bench);
      this.colliders.push(new THREE.Box3().setFromObject(bench));
    }

    // trees + lamps
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3e2a, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x436f47, roughness: 0.95 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xbfd9e8, emissive: 0x1a2733, roughness: 0.3 });
    const treePoints = [
      [-35, -8], [-30, 8], [-26, 24], [-14, 30], [12, 30], [28, 28], [36, 16], [34, -10], [16, -30], [-12, -32]
    ];

    for (const [x, z] of treePoints) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 3.3, 8), trunkMat);
      trunk.position.set(x, 1.65, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      this.colliders.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.65, z), new THREE.Vector3(1.2, 3.3, 1.2)));

      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 10, 10), leafMat);
      crown.position.set(x, 4.1, z);
      crown.castShadow = true;
      this.scene.add(crown);
    }

    for (let i = -2; i <= 2; i++) {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8), stoneMat);
      lamp.position.set(i * 8, 1.7, -5.5);
      lamp.castShadow = true;
      this.scene.add(lamp);

      const lampTop = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), lampMat);
      lampTop.position.set(i * 8, 3.6, -5.5);
      lampTop.castShadow = true;
      this.scene.add(lampTop);
    }
  }

  spawnDiscoveries(museum, park, market) {
    const collectibles = [
      ['Ancient Statue', museum, [-4, 1.1, 3], 'A weathered guardian from a lost dynasty.', 'artifact'],
      ['Archive Tablet', museum, [3.2, 1.1, 2.6], 'Stone panel describing forgotten routes.', 'artifact'],
      ['Interactive Globe', museum, [0.2, 1.1, -3], 'A rotating globe with hidden stars.', 'relic'],
      ['Runed Lens', museum, [-1.4, 1.1, -1], 'A crystal lens that refracts sky-fire.', 'relic'],
      ['Royal Seal', museum, [4.4, 1.1, -1.5], 'A wax seal preserved in metal.', 'artifact'],

      ['Garden Herb', park, [-3.5, 1.1, 2.9], 'Rare healing herb rooted near old waterlines.', 'nature'],
      ['Fountain Emblem', park, [2.5, 1.1, 0.4], 'A crest tied to ancient slayer guilds.', 'artifact'],
      ['Hidden Rune', park, [0.4, 1.1, -2.6], 'A rune shimmering softly in twilight.', 'relic'],
      ['Wind Chime Shard', park, [-1, 1.1, -4.4], 'A fragment that hums in breeze.', 'nature'],
      ['Sunken Coin', park, [5.2, 1.1, 2.2], 'A ceremonial coin from old markets.', 'artifact'],

      ['Merchant Charm', market, [-4.2, 1.1, 2.2], 'A lucky charm from a forgotten stall.', 'market'],
      ['Spice Ledger', market, [2.8, 1.1, 2.5], 'A trade ledger with coded routes.', 'market'],
      ['Silver Compass', market, [0.2, 1.1, -2.8], 'Compass that always points to home.', 'relic'],
      ['Lantern Core', market, [-1.3, 1.1, -3.8], 'An old lantern core still warm.', 'market'],
      ['Banner Crest', market, [4.8, 1.1, -0.4], 'A crest worn by traveling keepers.', 'artifact']
    ];

    collectibles.forEach(([name, zone, offset, description, rarity], i) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.48, 1),
        new THREE.MeshStandardMaterial({
          color: rarity === 'relic' ? 0x86b8ff : rarity === 'nature' ? 0x7be38a : rarity === 'market' ? 0xffc17a : 0xc5acef,
          emissive: 0x171717,
          roughness: 0.35,
          metalness: 0.32
        })
      );
      mesh.position.copy(zone).add(new THREE.Vector3(...offset));
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.interactables.push({
        mesh,
        name,
        description,
        area: zone === museum ? 'Museum Hall' : zone === park ? 'Park Plaza' : 'Market Lane',
        discovered: false,
        type: 'discovery',
        rarity
      });

      this.dynamic.push({ mesh, speed: 0.7 + Math.random() * 0.7, phase: Math.random() * Math.PI });
    });

    const egg = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.45, 0.12, 100, 16),
      new THREE.MeshStandardMaterial({ color: 0xff8ce8, emissive: 0x250523 })
    );
    egg.position.set(-14, 1.8, 22);
    egg.castShadow = true;
    this.scene.add(egg);
    this.interactables.push({ mesh: egg, name: 'Developer Easter Egg', description: 'You found a hidden relic with a playful signature.', area: 'Wilds', discovered: false, type: 'easter_egg', rarity: 'mythic' });
    this.dynamic.push({ mesh: egg, speed: 1.4, phase: 0 });

    this.collectibleCount = this.interactables.filter((item) => item.type !== 'npc').length;
  }

  spawnNpcGuide(position) {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 0.7, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xd6bc83 })
    );
    body.position.copy(position);
    body.castShadow = true;
    this.scene.add(body);
    this.npc = body;
    this.interactables.push({ mesh: body, name: 'Guide NPC', description: 'Guide: Recover discoveries and watch your quest tracker.', area: 'Hub', discovered: false, type: 'npc' });
  }

  spawnDust() {
    const count = 580;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 9 + 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: 0xdccfb7, size: 0.08, opacity: 0.48, transparent: true, depthWrite: false })
    );
    this.scene.add(this.dust);
  }

  update(time, rainy = false) {
    for (const item of this.dynamic) {
      item.mesh.rotation.y += 0.004 * item.speed;
      item.mesh.position.y += Math.sin(time * 0.00075 * item.speed + item.phase) * 0.003;
    }

    if (this.npc) this.npc.rotation.y = Math.sin(time * 0.0014) * 0.4;

    if (this.dust) {
      const arr = this.dust.geometry.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += Math.sin(time * 0.00032 + arr[i + 2]) * 0.0006;
        arr[i + 2] += Math.cos(time * 0.00024 + arr[i]) * 0.0006;
      }
      this.dust.geometry.attributes.position.needsUpdate = true;
      this.dust.material.opacity = rainy ? 0.22 : 0.48;
    }
  }

  setNight(enabled) {
    this.sun.intensity = enabled ? 0.23 : 1.05;
    this.scene.background = new THREE.Color(enabled ? 0x081326 : 0x8db2cd);
    this.scene.fog.color.set(enabled ? 0x2f3f5e : 0x88a5b5);
  }

  setShadows(enabled) {
    this.sun.castShadow = enabled;
  }
}
