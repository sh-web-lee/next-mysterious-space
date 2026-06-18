import { ModelBase } from "../ModelBase";

class House extends ModelBase {
  init() {
    super.init("house-model");
    if (this.model) {
      // Root node "殿堂" is at [0.85, 155.43, -7.20] with scale 100.
      // Offset scene position to bring the model into the camera's view.
      this.model.scene.position.set(0, 0.02, 0);
    }
  }
}

export const house = new House();
