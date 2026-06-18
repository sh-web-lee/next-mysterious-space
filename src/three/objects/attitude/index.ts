import * as THREE from "three";
import { ModelBase } from "../ModelBase";

class Attitude extends ModelBase {
  private groupPos: THREE.Vector3;
  constructor() {
    super();
    this.groupPos = new THREE.Vector3(5.44, 0.44, -9.83);
  }
  init() {
    super.init("attitude-model");
    if (this.model) {
      this.model.scene.position.copy(this.groupPos);
      this.model.scene.rotation.y = THREE.MathUtils.degToRad(-15.1);
    }
  }
}

export const attitude = new Attitude();
