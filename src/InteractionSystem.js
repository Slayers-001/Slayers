import * as THREE from 'three';

export class InteractionSystem {
  constructor(camera, interactables, onInteract, onHover, audio, onMissInteract = null) {
    this.camera = camera;
    this.interactables = interactables;
    this.onInteract = onInteract;
    this.onHover = onHover;
    this.audio = audio;
    this.onMissInteract = onMissInteract;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 4.4;
    this.current = null;
    this.meshToItem = new Map();
    this.meshCache = [];
    this.rebuildCache();

    window.addEventListener('keydown', (e) => {
      if (e.code !== 'KeyE') return;
      if (document.activeElement?.tagName === 'INPUT') return;
      this.interact();
    });
  }

  rebuildCache() {
    this.meshToItem.clear();
    this.meshCache = this.interactables.map((item) => {
      this.meshToItem.set(item.mesh, item);
      return item.mesh;
    });
  }

  update() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hits = this.raycaster.intersectObjects(this.meshCache, false);
    const candidate = hits.length ? hits[0].object : null;

    if (this.current && this.current !== candidate) {
      this.current.material.emissive?.setHex(0x161616);
      this.current.scale.setScalar(this.current.userData.baseScale || 1);
      this.onHover(null);
    }

    this.current = candidate;
    if (this.current) {
      this.current.material.emissive?.setHex(0x396f31);
      this.current.userData.baseScale ||= this.current.scale.x;
      this.current.scale.setScalar(this.current.userData.baseScale * 1.05);
      this.onHover(this.meshToItem.get(this.current));
    }
  }

  interact() {
    if (!this.current) {
      this.onMissInteract?.();
      return;
    }

    const item = this.meshToItem.get(this.current);
    if (!item) {
      this.onMissInteract?.();
      return;
    }

    this.audio.uiClick();
    const base = this.current.userData.baseScale || this.current.scale.x;
    this.current.scale.setScalar(base * 1.22);
    setTimeout(() => this.current.scale.setScalar(base * 1.05), 120);

    this.onInteract(item);
  }
}
