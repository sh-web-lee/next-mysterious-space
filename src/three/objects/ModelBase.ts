import { Mesh, Vector3 } from "three";
import { sceneGroup } from "@/three/core";
import { loadSources } from "@/utils/loadsources";
import { GLTF } from "three/examples/jsm/Addons.js";

/**
 * Base class for all 3D model objects (house, attitude, soul, wish).
 * Handles GLTF loading, scene attachment, child lookup, and cleanup.
 */
export class ModelBase {
  model: GLTF | null = null;

  /** Load the model from loadSources and attach it to the scene. */
  init(sourceKey: string) {
    this.model = loadSources.items[sourceKey] as GLTF;
    if (!this.model) {
      console.warn(`Model "${sourceKey}" not found in loaded sources`);
      return;
    }

    // Ensure all materials are opaque with correct depth settings
    // so the model properly occludes objects behind it (paths, floor).
    // GLTF models may import with transparent:true which puts them in
    // the transparent render pass and disables depth writing.
    this.model.scene.traverse((child) => {
      if (child instanceof Mesh) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const mat of materials) {
          mat.clipping = true;
          mat.clipShadows = true;
          mat.transparent = false;
          mat.depthWrite = true;
          mat.depthTest = true;
        }
        // Render after paths/floor to ensure correct occlusion
        child.renderOrder = 1;
      }
    });

    sceneGroup.instance.add(this.model.scene);
  }

  /** Traverse the model and return the world position of the named child. */
  getChildPosition(name: string): Vector3 | null {
    if (!this.model) return null;
    let result: Vector3 | null = null;
    this.model.scene.traverse((child) => {
      if (child.name === name) {
        result = new Vector3();
        child.getWorldPosition(result);
      }
    });
    return result;
  }

  destroy() {
    if (!this.model) return;
    sceneGroup.instance.remove(this.model.scene);
    this.model = null;
  }
}
