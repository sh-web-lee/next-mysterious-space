import { PerspectiveCamera, Vector3 } from "three";
import gsap from "gsap";
import sizes from "../../utils/Sizes";

/**
 * start pos 4.11 59.87 67.40
 * fov: 32.27
 *
 * end pos -0.22 0.00 8.97
 */

class Camera {
  instance: PerspectiveCamera | null;
  startPos: Vector3;
  endPos: Vector3;

  constructor() {
    this.instance = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      5000,
    );

    this.startPos = new Vector3(29.24, 13.93, -0.85);
    this.endPos = new Vector3(0, 0.1, 3.55);
  }

  init() {
    if (this.instance) {
      this.instance.position.copy(this.startPos);
    }
    sizes.on("resize", this.resize.bind(this));
  }

  /** Animate camera position and controls target from start to end.
   *  @param targetRef — the OrbitControls.target Vector3 to animate
   *  @param enabledRef — { enabled } to disable controls during animation
   */
  animateToEnd() {
    if (!this.instance) return;

    const tl = gsap.timeline({
      onComplete: () => {},
    });

    tl.to(
      this.instance.position,
      {
        x: this.endPos.x,
        y: this.endPos.y,
        z: this.endPos.z,
        duration: 3.5,
        ease: "power1.inOut",
      },
      0,
    );
  }

  resize() {
    this.instance && (this.instance.aspect = sizes.width / sizes.height);
    this.instance?.updateProjectionMatrix();
  }

  destroy() {
    if (!this.instance) return;
    sizes.off("resize", this.resize.bind(this));
  }
}

export const camera = new Camera();
