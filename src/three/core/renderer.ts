import { Plane, Vector3, WebGLRenderer } from "three";
import sizes from "../../utils/Sizes";
import { scene } from "./scene";
import { camera } from "./camera";
import { floor } from "@/three/objects/floor";
import gsap from "gsap";

class Renderer {
  instance: WebGLRenderer | null;
  constructor() {
    this.instance = null;
  }

  init(canvas: HTMLCanvasElement) {
    if (this.instance) return;
    this.instance = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });

    // Clip everything below y=0 — objects under the ground are invisible.
    this.instance.localClippingEnabled = true;
    this.instance.clippingPlanes = [new Plane(new Vector3(0, 1, 0), 0)];

    this.setClearColor(0x070707, 1);

    sizes.on("resize", this.#resize.bind(this));
    this.#resize();
  }

  /** Start the render loop — call after scene is fully set up */
  startLoop() {
    gsap.ticker.add(this.#ticker.bind(this));
  }

  getInstance = () => {
    if (!this.instance) throw new Error("Renderer not initialized");
    return this.instance;
  };

  setClearColor(color: number, alpha = 1) {
    this.instance?.setClearColor(color, alpha);
  }

  #ticker() {
    if (!this.instance) return;
    floor.update(); // keep shader camera-position uniform in sync
    this.instance.render(scene.instance, camera.instance!);
  }

  #resize() {
    if (!this.instance) return;
    this.instance?.setSize(sizes.width, sizes.height);
    this.instance?.setPixelRatio(sizes.pixelRatio);
  }

  destroy() {
    if (!this.instance) return;
    this.instance.dispose();
    this.instance = null;
  }
}

export const renderer = new Renderer();
