import { ModelBase } from "../ModelBase";

class Skyscrapers extends ModelBase {
  init() {
    super.init("skyscrapers-model");
    if (this.model) {
      // Root node "殿堂" is at [0.85, 155.43, -7.20] with scale 100.
      // Offset scene position to bring the model into the camera's view.
      this.model.scene.position.set(-2, 0, -4);
      this.model.scene.scale.set(0.02, 0.02, 0.02);
    }
  }
}

export const skyscrapers = new Skyscrapers();
