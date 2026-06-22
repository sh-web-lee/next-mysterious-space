import { AmbientLight, DirectionalLight } from "three";
import { scene } from "./scene";

class Lights {
  ambientLight: AmbientLight | null = null;
  directionalLight: DirectionalLight | null = null;

  init() {
    this.ambientLight = new AmbientLight(0xffffff, 0.6);
    scene.instance.add(this.ambientLight);

    this.directionalLight = new DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 5);
    scene.instance.add(this.directionalLight);
  }

  destroy() {
    if (this.ambientLight) {
      scene.instance.remove(this.ambientLight);
      this.ambientLight = null;
    }
    if (this.directionalLight) {
      scene.instance.remove(this.directionalLight);
      this.directionalLight = null;
    }
  }
}

export const lights = new Lights();
