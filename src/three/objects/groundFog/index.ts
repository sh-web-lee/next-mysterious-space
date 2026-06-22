import {
  BufferGeometry,
  Float32BufferAttribute,
  Color,
  Points,
  PointsMaterial,
  Texture,
  AdditiveBlending,
} from "three";
import { sceneGroup } from "@/three/core/group";
import { loadSources } from "@/utils/loadsources";

// ── Cloud parameters ──────────────────────────────────
const CLOUD_PARAMS = {
  particleCount: 2,
  color: "#b0aaa0",
  opacity: 0.5,
};

// ── Cluster centres (ground-level mist around the temple) ──
const CLUSTER_CENTERS = [
  { x: 1, y: 0.1, z: 1.1 },
  { x: -1, y: 0.1, z: 1.1 },
];

// Different particle sizes → each cloud has different volume
const SIZE_VARIANTS = [1.4, 2.2];

class GroundFog {
  private pointsGroups: Points[] = [];
  private cloudTexture: Texture | null = null;
  private materials: PointsMaterial[] = [];

  init() {
    this.cloudTexture = loadSources.items["cloud-texture"] as Texture;
    if (!this.cloudTexture) {
      console.warn("GroundFog: cloud-texture not found in loaded sources");
      return;
    }

    const params = CLOUD_PARAMS;

    for (let i = 0; i < CLUSTER_CENTERS.length; i++) {
      const center = CLUSTER_CENTERS[i];
      const pSize = SIZE_VARIANTS[i];

      const material = new PointsMaterial({
        map: this.cloudTexture,
        color: new Color(params.color),
        size: pSize,
        transparent: true,
        opacity: params.opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      this.materials.push(material);

      // All particles at exact CLUSTER_CENTERS position
      const positions: number[] = [];
      for (let j = 0; j < params.particleCount; j++) {
        positions.push(center.x, center.y, center.z);
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new Float32BufferAttribute(positions, 3),
      );
      geometry.computeBoundingSphere();

      const points = new Points(geometry, material);
      points.renderOrder = 2;
      sceneGroup.instance.add(points);
      this.pointsGroups.push(points);
    }
  }

  destroy() {
    for (const points of this.pointsGroups) {
      sceneGroup.instance.remove(points);
      points.geometry.dispose();
    }
    for (const mat of this.materials) {
      mat.dispose();
    }
    this.pointsGroups = [];
    this.materials = [];
    this.cloudTexture = null;
  }
}

export const groundFog = new GroundFog();
