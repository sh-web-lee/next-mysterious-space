import { PMREMGenerator, Texture } from "three";
import { renderer } from "@/three/core/renderer";
import { scene } from "@/three/core/scene";
import { loadSources } from "@/utils/loadsources";

/**
 * Sky background rendered from an HDR equirectangular environment map.
 *
 * Converts the loaded HDR texture into a cube environment map via PMREMGenerator
 * and sets it as both scene.background (visible sky) and scene.environment (IBL).
 */
class Sky {
  private envMap: Texture | null = null;

  init() {
    const hdrTexture = loadSources.items["scene-hdr"] as Texture;
    if (!hdrTexture) {
      console.warn('Sky: HDR texture "scene-hdr" not found in loaded sources');
      return;
    }

    const pmremGenerator = new PMREMGenerator(renderer.getInstance());
    pmremGenerator.compileEquirectangularShader();
    this.envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

    scene.instance.background = this.envMap;
    scene.instance.environment = this.envMap;

    pmremGenerator.dispose();
  }

  destroy() {
    if (this.envMap) {
      scene.instance.background = null;
      scene.instance.environment = null;
      this.envMap.dispose();
      this.envMap = null;
    }
  }
}

export const sky = new Sky();
