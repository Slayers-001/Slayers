import * as THREE from 'three';

export class InteractionSystem {
  constructor(camera, interactables, onInteract, onHover, audio) {
    this.camera = camera;
    this.interactables = interactables;
    this.onInteract = onInteract;
    this.onHover = onHover;
    this.audio = audio;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 4.2;
    this.current = null;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') this.interact();
    });
  }

  update() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hits = this.raycaster.intersectObjects(this.interactables.map((item) => item.mesh), false);
    const candidate = hits[0]?.object || null;

    if (this.current && this.current !== candidate) {
      this.current.material.emissive?.setHex(0x161616);
      this.current.scale.setScalar(this.current.userData.baseScale || 1);
      this.onHover(null);
    }

    this.current = candidate;
    if (this.current) {
      this.current.material.emissive?.setHex(0x375f2d);
      this.current.userData.baseScale ||= this.current.scale.x;
      this.current.scale.setScalar(this.current.userData.baseScale * 1.04);
      const item = this.interactables.find((obj) => obj.mesh === this.current);
      this.onHover(item);
    }
  }

  interact() {
    if (!this.current) return;
    const item = this.interactables.find((obj) => obj.mesh === this.current);
    if (!item) return;

    this.audio.uiClick();
    const base = this.current.userData.baseScale || this.current.scale.x;
    this.current.scale.setScalar(base * 1.25);
    setTimeout(() => this.current.scale.setScalar(base * 1.04), 120);

    this.onInteract(item);
  }
}
