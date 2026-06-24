import {
  Mesh,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  Vector3,
} from "three";
import { sceneGroup } from "@/three/core/group";
import { loadSources } from "@/utils/loadsources";
import { camera } from "@/three/core/camera";
import vertexShader from "@/three/shaders/floor/vertex.glsl";
import fragmentShader from "@/three/shaders/floor/fragment.glsl";

class Floor {
  mesh: Mesh | null = null;
  /** Dedicated Vector3 for the shader uniform — NOT a shared reference to camera.position. */
  private cameraPosUniform = new Vector3();

  init() {
    const texture = loadSources.items["floor-texture"] as Texture;
    if (!texture) {
      console.warn("Stone texture not found in loaded sources");
      return;
    }

    // Repeat wrapping so world-space UVs tile correctly
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    // Plane extends well beyond the camera far-clip plane (1000),
    // so the geometric edges are never visible from any camera position.
    // The shader's distance fog handles the visual fade-out at range.
    const geometry = new PlaneGeometry(3000, 3000);
    const material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uCameraPosition: { value: this.cameraPosUniform },
      },
      vertexShader,
      fragmentShader,
      transparent: false,
      depthWrite: false,
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.renderOrder = -1; // Render before all other objects (paths=0, models=1, clouds=2)
    // Rotate to horizontal (XZ plane), offset above y=0 to stay clear of the
    // global clipping plane (y >= 0) on all GPU backends, especially macOS/Metal.
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0.01;

    sceneGroup.instance.add(this.mesh);
  }

  /** Keep the shader's camera-position uniform in sync (called each frame). */
  update() {
    if (!this.mesh || !camera.instance) return;
    this.cameraPosUniform.copy(camera.instance.position);
  }

  destroy() {
    if (!this.mesh) return;
    sceneGroup.instance.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as ShaderMaterial).dispose();
    this.mesh = null;
  }
}

export const floor = new Floor();
