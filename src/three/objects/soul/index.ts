import { ModelBase } from "../ModelBase";
import { Vector3 } from "three";

class Soul extends ModelBase {
  private groupPos: Vector3;
  constructor() {
    super();
    this.groupPos = new Vector3(-3.26, 1.55, -4.13);
  }
  init() {
    super.init("soul-model");
    if (this.model) {
      this.model.scene.position.copy(this.groupPos);
    }
  }
}

export const soul = new Soul();
