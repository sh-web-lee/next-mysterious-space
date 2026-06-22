import { Group } from "three";
import { scene } from "./scene";

class SceneGroup {
  instance: Group;

  constructor() {
    this.instance = new Group();
  }

  init() {
    this.instance.position.set(0, 0, 0);

    scene.instance.add(this.instance);
  }

  destroy() {
    scene.instance.remove(this.instance);
  }
}

export const sceneGroup = new SceneGroup();
