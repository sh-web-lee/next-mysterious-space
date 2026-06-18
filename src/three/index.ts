import { camera } from "./core/camera";
import { controls } from "./core/controls";
import { sceneGroup } from "./core/group";
import { lights } from "./core/lights";
import { renderer } from "./core/renderer";
import { objects } from "./objects";

class Three {
  /** Init renderer, lights, camera, controls, and start the render loop.
   *  Objects are deferred until models finish loading (call initObjects). */
  initCore(canvas: HTMLCanvasElement) {
    renderer.init(canvas);
    lights.init();
    camera.init();
    controls.init();
    sceneGroup.init();

    // Set controls target from camera matrix so initial view matches Editor
    // controls.instance!.target.copy(camera.endTarget);
    // controls.instance!.update();
    // const axesHelper = new AxesHelper(5);
    // scene.instance.add(axesHelper);

    objects.init();

    renderer.startLoop();
  }

  destroy() {
    controls.destroy();
    renderer.destroy();
    objects.destroy();
    sceneGroup.destroy();
    lights.destroy();
  }
}

export const three = new Three();
