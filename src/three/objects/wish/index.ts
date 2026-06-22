import { ModelBase } from "../ModelBase";
import * as THREE from "three";

class Wish extends ModelBase {
  init() {
    super.init("wish-model");
    if (this.model) {
      this.model.scene.position.set(-2.49, 0.02, -0.86);
      this.model.scene.rotation.y = THREE.MathUtils.degToRad(21.3);
      // this.model.scene.rotation.z = THREE.MathUtils.degToRad(35.81);
      // this.model.scene.rotation.y = THREE.MathUtils.degToRad(16.2);
    }
  }
}

export const wish = new Wish();
