import { Mesh, MeshBasicMaterial, PlaneGeometry, Color, Texture } from "three";
import { sceneGroup } from "@/three/core/group";
import { camera } from "@/three/core/camera";
import { loadSources } from "@/utils/loadsources";
import gsap from "gsap";

// ── Cloud parameters ──────────────────────────────────
const CLOUD_PARAMS = {
  speed: 0.5,
  opacity: 0.95,
  density: 0.8,
  color: "#d5cfc3",
  turbulence: 0.5,
  scale: 1,
  count: 8,
};

// ── Cluster centres (ground-level mist around the temple) ──
const CLUSTER_CENTERS = [
  { x: 1, y: 0.35, z: 1.4 },
  { x: -1, y: 0.35, z: 1.4 },
];

// ── Per-puff runtime state ────────────────────────────
interface PuffState {
  mesh: Mesh;
  material: MeshBasicMaterial;
  baseX: number;
  baseZ: number;
  baseY: number;
  driftAngle: number;
  driftSpeed: number;
  ySwaySpeed: number;
  ySwayAmt: number;
  rollSpeed: number;
  breathPeriod: number;
  breathPhase: number;
  baseOpacity: number;
}

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

// ── Geometry cache ────────────────────────────────────
const GEO_CACHE: Record<string, PlaneGeometry> = {};

function getGeometry(size: number): PlaneGeometry {
  const key = (Math.round(size * 2) / 2).toFixed(1);
  if (!GEO_CACHE[key]) GEO_CACHE[key] = new PlaneGeometry(size * 1.1, size);
  return GEO_CACHE[key];
}

class GroundFog {
  private puffs: PuffState[] = [];
  private sharedMaterial: MeshBasicMaterial | null = null;
  private startTime = 0;
  private driftRadius = 0;
  private ticker: (() => void) | null = null;
  private cloudTexture: Texture | null = null;

  init() {
    // ── Get cloud texture from loaded sources ─────────
    this.cloudTexture = loadSources.items["cloud-texture"] as Texture;
    if (!this.cloudTexture) {
      console.warn("GroundFog: cloud-texture not found in loaded sources");
      return;
    }

    const params = CLOUD_PARAMS;
    this.startTime = performance.now() / 1000;
    this.driftRadius = params.scale * 2.2;

    // ── Shared template material ──────────────────────
    this.sharedMaterial = new MeshBasicMaterial({
      map: this.cloudTexture,
      color: new Color(params.color),
      transparent: true,
      opacity: params.opacity,
      depthWrite: false,
    });

    // ── Spawn puffs across cluster centres ────────────
    const countPerCluster = Math.max(
      1,
      Math.floor(params.count / CLUSTER_CENTERS.length),
    );

    for (const center of CLUSTER_CENTERS) {
      for (let i = 0; i < countPerCluster; i++) {
        const puff = this.createPuff(center, params);
        sceneGroup.instance.add(puff.mesh);
        this.puffs.push(puff);
      }
    }

    // ── Self-managed tick ─────────────────────────────
    this.ticker = this.#tick.bind(this);
    gsap.ticker.add(this.ticker);
  }

  private createPuff(
    center: { x: number; y: number; z: number },
    params: typeof CLOUD_PARAMS,
  ): PuffState {
    const size = rand(params.scale * 0.8, params.scale * 1.4);
    const geometry = getGeometry(size);

    // Clone so each puff gets its own opacity
    const mat = this.sharedMaterial!.clone();

    const mesh = new Mesh(geometry, mat);
    mesh.renderOrder = 2;
    if (camera.instance) mesh.lookAt(camera.instance.position);

    // Position exactly at cluster centre
    const baseX = center.x;
    const baseZ = center.z;
    const baseY = center.y;

    mesh.position.set(baseX, baseY, baseZ);

    const baseOpacity = rand(params.opacity * 0.75, params.opacity * 1.25);

    return {
      mesh,
      material: mat,
      baseX,
      baseZ,
      baseY,
      driftAngle: rand(0, Math.PI * 2),
      driftSpeed: rand(0.005, 0.015) * params.speed,
      ySwaySpeed: rand(0.3, 0.6),
      ySwayAmt: rand(0.08, 0.22),
      rollSpeed: rand(-0.025, 0.025) * params.speed,
      breathPeriod: rand(8, 22),
      breathPhase: rand(0, Math.PI * 2),
      baseOpacity,
    };
  }

  #tick() {
    if (!this.sharedMaterial || !camera.instance) return;

    const elapsed = performance.now() / 1000 - this.startTime;
    const params = CLOUD_PARAMS;
    const camPos = camera.instance.position;

    for (const puff of this.puffs) {
      // ── Drift ───────────────────────────────────────
      const dynamicAngle =
        puff.driftAngle + Math.sin(elapsed * 0.16 + puff.breathPhase) * 0.22;
      const driftDist = puff.driftSpeed * (1 / 60);
      puff.baseX += Math.cos(dynamicAngle) * driftDist;
      puff.baseZ += Math.sin(dynamicAngle) * driftDist;

      // ── Nearest cluster centre ──────────────────────
      let nearest = CLUSTER_CENTERS[0];
      let minD = Infinity;
      for (const c of CLUSTER_CENTERS) {
        const d = (puff.baseX - c.x) ** 2 + (puff.baseZ - c.z) ** 2;
        if (d < minD) {
          minD = d;
          nearest = c;
        }
      }
      const dist = Math.sqrt(minD);

      // ── Border fade ─────────────────────────────────
      let borderFade = 1.0;
      if (dist > this.driftRadius * 0.5) {
        const t = Math.max(
          0,
          Math.min(
            1,
            (dist - this.driftRadius * 0.5) / (this.driftRadius * 0.5),
          ),
        );
        borderFade = 1.0 - t * t * (3.0 - 2.0 * t);
      }

      // ── Respawn ─────────────────────────────────────
      if (dist >= this.driftRadius) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0, this.driftRadius * 0.3);
        puff.baseX = nearest.x + Math.cos(a) * r;
        puff.baseZ = nearest.z + Math.sin(a) * r;
        puff.baseY = nearest.y + rand(-0.6, 0.6);
        puff.driftAngle = rand(0, Math.PI * 2);
        borderFade = 0.0;
      }

      // ── Vertical sway ───────────────────────────────
      const currentY =
        puff.baseY +
        Math.sin(elapsed * puff.ySwaySpeed + puff.breathPhase) * puff.ySwayAmt;

      // ── Breathing opacity ───────────────────────────
      const breath =
        Math.sin(
          (elapsed / puff.breathPeriod) * Math.PI * 2 + puff.breathPhase,
        ) * 0.25;
      const finalOpacity = Math.max(
        0.01,
        (puff.baseOpacity + breath * puff.baseOpacity) *
          borderFade *
          params.opacity,
      );

      // ── Roll ────────────────────────────────────────
      puff.mesh.rotation.z += puff.rollSpeed * (1 / 60);

      // ── Apply position + billboard ──────────────────
      puff.mesh.position.set(puff.baseX, currentY, puff.baseZ);
      if (camPos) puff.mesh.lookAt(camPos);

      // ── Update per-puff opacity ─────────────────────
      puff.material.opacity = finalOpacity;
    }
  }

  destroy() {
    if (this.ticker) {
      gsap.ticker.remove(this.ticker);
      this.ticker = null;
    }
    for (const puff of this.puffs) {
      sceneGroup.instance.remove(puff.mesh);
      puff.material.dispose();
    }
    for (const k of Object.keys(GEO_CACHE)) {
      GEO_CACHE[k]?.dispose();
      delete GEO_CACHE[k];
    }
    this.sharedMaterial?.dispose();
    this.sharedMaterial = null;
    this.puffs = [];
  }
}

export const groundFog = new GroundFog();
