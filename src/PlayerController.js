import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

export class PlayerController {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.body = new THREE.Object3D();
    this.body.position.set(0, 1.8, 8);
    this.body.add(camera);
    scene.add(this.body);

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.keys = new Set();
    this.grounded = false;
    this.noclip = false;
    this.baseSpeed = 6;
    this.sprintMul = 1.65;
    this.crouchMul = 0.55;
    this.mouseSensitivity = 0.002;
    this.headBobTime = 0;
    this.sway = new THREE.Vector2();
    this.landingShake = 0;
    this.height = 1.8;
    this.targetHeight = 1.8;
    this.fallStartY = this.body.position.y;

    this.yaw = 0;
    this.pitch = 0;

    this._bind();
  }

  _bind() {
    addEventListener('keydown', (e) => this.keys.add(e.code));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== document.body) return;
      this.yaw -= e.movementX * this.mouseSensitivity;
      this.pitch -= e.movementY * this.mouseSensitivity;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });
  }

  setSpeed(v) { this.baseSpeed = v; }
  setSensitivity(v) { this.mouseSensitivity = v; }

  update(dt, colliders) {
    this.body.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    const moveForward = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const moveRight = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    const isSprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const isCrouch = this.keys.has('KeyC');

    this.targetHeight = isCrouch ? 1.25 : 1.8;
    this.height += (this.targetHeight - this.height) * Math.min(1, dt * 12);
    this.camera.position.y = this.height - 1.8;

    const speed = this.baseSpeed * (isSprint ? this.sprintMul : 1) * (isCrouch ? this.crouchMul : 1);
    this.direction.set(moveRight, 0, moveForward).normalize();

    const targetX = this.direction.x * speed;
    const targetZ = this.direction.z * speed;
    const accel = this.grounded ? 14 : 5;
    this.velocity.x += (targetX - this.velocity.x) * Math.min(1, accel * dt);
    this.velocity.z += (targetZ - this.velocity.z) * Math.min(1, accel * dt);

    if (!this.noclip) {
      this.velocity.y -= 21 * dt;
      if (this.grounded && this.keys.has('Space')) {
        this.velocity.y = 8.5;
        this.grounded = false;
      }
    }

    const worldVel = new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const prev = this.body.position.clone();
    this.body.position.addScaledVector(worldVel, dt);

    if (!this.noclip) {
      this.resolveGround(colliders, prev.y);
      this.resolveHorizontal(colliders, prev);
    }

    const moving = Math.abs(this.velocity.x) + Math.abs(this.velocity.z) > 0.4 && this.grounded;
    this.headBobTime += moving ? dt * (isSprint ? 14 : 9) : 0;
    const bob = moving ? Math.sin(this.headBobTime) * 0.03 : 0;
    this.sway.x += ((moving ? Math.sin(this.headBobTime * 0.5) * 0.015 : 0) - this.sway.x) * Math.min(1, dt * 8);
    this.sway.y += ((moving ? Math.cos(this.headBobTime * 0.65) * 0.01 : 0) - this.sway.y) * Math.min(1, dt * 8);

    this.camera.position.y += bob;
    this.camera.position.x = this.sway.x;
    this.camera.position.z = this.sway.y;

    if (this.landingShake > 0) {
      this.landingShake = Math.max(0, this.landingShake - dt * 4);
      const n = (Math.random() - 0.5) * 0.02 * this.landingShake;
      this.camera.position.x += n;
      this.camera.position.y += n;
    }
  }

  resolveGround(colliders, prevY) {
    this.grounded = false;
    const feetY = this.body.position.y - this.height;
    for (const box of colliders) {
      const inX = this.body.position.x > box.min.x - 0.3 && this.body.position.x < box.max.x + 0.3;
      const inZ = this.body.position.z > box.min.z - 0.3 && this.body.position.z < box.max.z + 0.3;
      if (!inX || !inZ) continue;
      if (feetY <= box.max.y && feetY > box.max.y - 1.6 && this.velocity.y <= 0) {
        if (!this.grounded && prevY - this.body.position.y > 0.6) this.landingShake = 1;
        this.body.position.y = box.max.y + this.height;
        this.velocity.y = 0;
        this.grounded = true;
      }
    }
    if (this.body.position.y < -25) {
      this.body.position.set(0, 2.6, 8);
      this.velocity.set(0, 0, 0);
    }
  }

  resolveHorizontal(colliders, prev) {
    const radius = 0.35;
    for (const box of colliders) {
      const overlapsY = this.body.position.y - this.height < box.max.y && this.body.position.y > box.min.y;
      if (!overlapsY) continue;
      if (this.body.position.x > box.min.x - radius && this.body.position.x < box.max.x + radius && this.body.position.z > box.min.z - radius && this.body.position.z < box.max.z + radius) {
        const dx = Math.min(Math.abs(box.min.x - this.body.position.x), Math.abs(box.max.x - this.body.position.x));
        const dz = Math.min(Math.abs(box.min.z - this.body.position.z), Math.abs(box.max.z - this.body.position.z));
        if (dx < dz) this.body.position.x = prev.x;
        else this.body.position.z = prev.z;
      }
    }
  }
}
