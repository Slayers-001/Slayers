import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);

export class PlayerController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.object = new THREE.Object3D();
    this.object.position.set(0, 2.2, 8);
    this.object.add(camera);

    this.velocity = new THREE.Vector3();
    this.intent = new THREE.Vector3();
    this.keys = new Set();

    this.radius = 0.35;
    this.standingHeight = 1.8;
    this.crouchHeight = 1.15;
    this.height = this.standingHeight;
    this.grounded = false;
    this.noclip = false;
    this.walkSpeed = 7;

    this.mouseSensitivity = 0.0022;
    this.pitch = 0;
    this.yaw = 0;
    this.headBobT = 0;
    this.landingImpact = 0;

    this.jumpVelocity = 8.8;
    this.gravity = 23;
    this.accelGround = 26;
    this.accelAir = 7;

    this._bind();
  }

  _bind() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== this.domElement) return;
      this.yaw -= e.movementX * this.mouseSensitivity;
      this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch - e.movementY * this.mouseSensitivity));
    });
  }

  setSensitivity(v) { this.mouseSensitivity = v; }
  setSpeed(v) { this.walkSpeed = v; }

  update(dt, colliders) {
    this.object.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    const sprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const crouch = this.keys.has('KeyC');
    const targetHeight = crouch ? this.crouchHeight : this.standingHeight;
    this.height += (targetHeight - this.height) * Math.min(1, dt * 14);

    const forwardInput = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const strafeInput = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    this.intent.set(strafeInput, 0, -forwardInput).normalize();

    const moveSpeed = this.walkSpeed * (sprint ? 1.55 : 1) * (crouch ? 0.58 : 1);
    const accel = this.grounded ? this.accelGround : this.accelAir;
    this.velocity.x += (this.intent.x * moveSpeed - this.velocity.x) * Math.min(1, accel * dt);
    this.velocity.z += (this.intent.z * moveSpeed - this.velocity.z) * Math.min(1, accel * dt);

    if (!this.noclip) {
      this.velocity.y -= this.gravity * dt;
      if (this.grounded && this.keys.has('Space')) {
        this.velocity.y = this.jumpVelocity;
        this.grounded = false;
      }
    } else {
      this.velocity.y = (Number(this.keys.has('Space')) - Number(this.keys.has('ControlLeft'))) * moveSpeed;
    }

    const worldVelocity = new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z).applyAxisAngle(UP, this.yaw);
    const previous = this.object.position.clone();
    this.object.position.addScaledVector(worldVelocity, dt);

    if (!this.noclip) {
      this.resolveGround(colliders, previous.y);
      this.resolveWalls(colliders, previous);
    }

    const moving = this.grounded && Math.hypot(this.velocity.x, this.velocity.z) > 0.5;
    this.headBobT += moving ? dt * (sprint ? 15 : 10.5) : 0;
    this.camera.position.set(
      Math.sin(this.headBobT * 0.55) * 0.018,
      this.height - this.standingHeight + (moving ? Math.sin(this.headBobT) * 0.025 : 0),
      Math.cos(this.headBobT * 0.62) * 0.012
    );

    if (this.landingImpact > 0) {
      this.landingImpact = Math.max(0, this.landingImpact - dt * 3.5);
      const shake = (Math.random() - 0.5) * 0.023 * this.landingImpact;
      this.camera.position.x += shake;
      this.camera.position.y += shake;
    }
  }

  resolveGround(colliders, oldY) {
    this.grounded = false;
    const feet = this.object.position.y - this.height;

    for (const box of colliders) {
      const insideXZ = this.object.position.x > box.min.x - this.radius && this.object.position.x < box.max.x + this.radius && this.object.position.z > box.min.z - this.radius && this.object.position.z < box.max.z + this.radius;
      if (!insideXZ) continue;

      const top = box.max.y;
      if (feet <= top && feet >= top - 1.3 && this.velocity.y <= 0) {
        if (!this.grounded && oldY - this.object.position.y > 0.65) this.landingImpact = 1;
        this.object.position.y = top + this.height;
        this.velocity.y = 0;
        this.grounded = true;
      }
    }

    if (this.object.position.y < -40) {
      this.object.position.set(0, 2.2, 8);
      this.velocity.set(0, 0, 0);
    }
  }

  resolveWalls(colliders, previous) {
    for (const box of colliders) {
      const hitY = this.object.position.y - this.height < box.max.y && this.object.position.y > box.min.y;
      if (!hitY) continue;

      const hitX = this.object.position.x > box.min.x - this.radius && this.object.position.x < box.max.x + this.radius;
      const hitZ = this.object.position.z > box.min.z - this.radius && this.object.position.z < box.max.z + this.radius;
      if (!hitX || !hitZ) continue;

      const pushX = Math.min(Math.abs(box.min.x - this.object.position.x), Math.abs(box.max.x - this.object.position.x));
      const pushZ = Math.min(Math.abs(box.min.z - this.object.position.z), Math.abs(box.max.z - this.object.position.z));
      if (pushX < pushZ) this.object.position.x = previous.x;
      else this.object.position.z = previous.z;
    }
  }
}
