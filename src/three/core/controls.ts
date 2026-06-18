import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { camera } from "./camera";
import { renderer } from "./renderer";
import gsap from "gsap";

class Controls {
  instance: OrbitControls | null = null;

  init() {
    this.instance = new OrbitControls(camera.instance!, renderer.getInstance().domElement);
    this.instance.target.set(0, 0.3, 0); // look slightly upward
    this.instance.minPolarAngle = 0; // allow top-down
    this.instance.maxPolarAngle = Math.PI; // will be clamped dynamically per frame
    this.instance.minDistance = 2.5;
    this.instance.maxDistance = 100;
    // this.instance.rotateSpeed = 0.1;
    gsap.ticker.add(this.#tick.bind(this));
  }

  #tick() {
    // Dynamically constrain maxPolarAngle so camera Y never drops below 0.1.
    // Must be set BEFORE update() so OrbitControls clamps internally — clamping
    // the position AFTER update() fights the internal spherical state and jitters.
    //
    // Three.js spherical:  camera.y = target.y + radius·cos(phi)
    //   phi=0 → camera at top (+Y),  phi=π/2 → horizontal (target level)
    // Constraint:  target.y + radius·cos(phi) >= minY  →  cos(phi) >= (minY − target.y) / radius
    if (this.instance && camera.instance) {
      const t = this.instance.target;
      const p = camera.instance.position;
      const radius = Math.sqrt((p.x - t.x) ** 2 + (p.y - t.y) ** 2 + (p.z - t.z) ** 2);
      const cosMin = (0.1 - t.y) / radius;

      if (cosMin >= 1) {
        // Even at phi=0 (max Y), camera Y < minY — lock to top-down
        this.instance.maxPolarAngle = 0;
      } else {
        // Allow the camera to dip below target level (phi > π/2) for upward gaze,
        // but never let it go completely underground.
        this.instance.maxPolarAngle = Math.min(Math.PI * 0.75, Math.acos(cosMin));
      }
    }
    this.instance?.update();
  }

  destroy() {
    gsap.ticker.remove(this.#tick.bind(this));
    this.instance?.dispose();
    this.instance = null;
  }
}

export const controls = new Controls();
