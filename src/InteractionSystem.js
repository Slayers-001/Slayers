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

    window.addEventListener('keydown', (e) => {
      if (e.code !== 'KeyE') return;
      if (document.activeElement?.tagName === 'INPUT') return;
      this.interact();
    });
  }

  update() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hits = this.raycaster.intersectObjects(this.interactables.map((item) => item.mesh), false);
    const candidate = hits.length ? hits.reduce((nearest, hit) => (hit.distance < nearest.distance ? hit : nearest), hits[0]).object : null;

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
      const item = this.interactables.find((obj) => obj.mesh === this.current);
      this.onHover(item);
    }
  }

  interact() {
    if (!this.current) {
      this.onMissInteract?.();
      return;
    }

    const item = this.interactables.find((obj) => obj.mesh === this.current);
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
