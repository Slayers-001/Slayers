import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

export class InteractionSystem {
  constructor(camera, scene, interactables, onDiscover, audioManager) {
    this.camera = camera;
    this.scene = scene;
    this.items = interactables;
    this.onDiscover = onDiscover;
    this.audio = audioManager;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 3.6;
    this.current = null;
    this.outlineMat = new THREE.MeshStandardMaterial({ color: 0xfff78a, emissive: 0x242400, wireframe: true });

    addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') this.interact();
    });
  }

  update() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersections = this.raycaster.intersectObjects(this.items.map((i) => i.mesh), false);
    const nearest = intersections[0]?.object || null;

    if (this.current && this.current !== nearest) this.current.material.emissive?.setHex(0x111111);
    this.current = nearest;
    if (this.current) this.current.material.emissive?.setHex(0x284425);
  }

  interact() {
    const target = this.items.find((i) => i.mesh === this.current);
    if (!target) return;
    this.audio.click();

    const orig = target.mesh.scale.clone();
    target.mesh.scale.multiplyScalar(1.2);
    setTimeout(() => target.mesh.scale.copy(orig), 120);

    if (!target.discovered) {
      target.discovered = true;
      this.onDiscover(target);
    }
  }
}
