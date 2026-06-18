import { Mesh, MeshBasicMaterial, PlaneGeometry, Color, Texture } from "three";
import { sceneGroup } from "@/three/core/group";
import { camera } from "@/three/core/camera";
import { loadSources } from "@/utils/loadsources";
import gsap from "gsap";

// ── Sky cloud parameters ────────────────────────────
const SKY_PARAMS = {
  speed: 0.2,
  opacity: 0.45,
  color: "#ece8e0",
  scale: 4.0,
  count: 22,
};

// ── Cluster centres (airborne, scattered across the scene) ──
const CLUSTER_CENTERS = [
  { x: 5, y: 5.5, z: -8 },
  { x: -6, y: 4.8, z: -10 },
  { x: 8, y: 6.2, z: -4 },
  { x: -4, y: 3.5, z: -6 },
  { x: 3, y: 7.0, z: -12 },
  { x: -8, y: 5.0, z: -3 },
  { x: 0, y: 4.0, z: -7 },
  { x: 6, y: 6.8, z: -14 },
  { x: -3, y: 8.0, z: -9 },
  { x: 10, y: 5.8, z: -11 },
  { x: -10, y: 6.5, z: -5 },
  { x: 2, y: 3.2, z: -13 },
  { x: -7, y: 7.5, z: -8 },
  { x: 9, y: 4.2, z: -6 },
  { x: -2, y: 5.8, z: -15 },
  { x: 4, y: 6.0, z: -2 },
];

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

const GEO_CACHE: Record<string, PlaneGeometry> = {};

function getGeometry(size: number): PlaneGeometry {
  const key = (Math.round(size * 2) / 2).toFixed(1);
  if (!GEO_CACHE[key]) GEO_CACHE[key] = new PlaneGeometry(size, size);
  return GEO_CACHE[key];
}

class SkyClouds {
  private puffs: PuffState[] = [];
  private sharedMaterial: MeshBasicMaterial | null = null;
  private startTime = 0;
  private driftRadius = 0;
  private ticker: (() => void) | null = null;
  private cloudTexture: Texture | null = null;

  init() {
    this.cloudTexture = loadSources.items["cloud-texture"] as Texture;
    if (!this.cloudTexture) {
      console.warn("SkyClouds: cloud-texture not found");
      return;
    }

    const params = SKY_PARAMS;
    this.startTime = performance.now() / 1000;
    this.driftRadius = params.scale * 3.0;

    this.sharedMaterial = new MeshBasicMaterial({
      map: this.cloudTexture,
      color: new Color(params.color),
      transparent: true,
      opacity: params.opacity,
      depthWrite: false,
    });

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

    // Extra puffs to reach target count
    while (this.puffs.length < params.count) {
      const extraCenter = CLUSTER_CENTERS[Math.floor(Math.random() * CLUSTER_CENTERS.length)];
      const puff = this.createPuff(extraCenter, params);
      sceneGroup.instance.add(puff.mesh);
      this.puffs.push(puff);
    }

    this.ticker = this.#tick.bind(this);
    gsap.ticker.add(this.ticker);
  }

  private createPuff(
    center: { x: number; y: number; z: number },
    params: typeof SKY_PARAMS,
  ): PuffState {
    const size = rand(params.scale * 0.7, params.scale * 1.6);
    const geometry = getGeometry(size);
    const mat = this.sharedMaterial!.clone();

    const mesh = new Mesh(geometry, mat);
    mesh.renderOrder = 2;
    if (camera.instance) mesh.lookAt(camera.instance.position);

    // Random offset from cluster centre for natural look
    const baseX = center.x + rand(-2, 2);
    const baseZ = center.z + rand(-2, 2);
    const baseY = center.y + rand(-1.5, 1.5);

    mesh.position.set(baseX, baseY, baseZ);

    const baseOpacity = rand(params.opacity * 0.5, params.opacity * 1.3);

    return {
      mesh,
      material: mat,
      baseX,
      baseZ,
      baseY,
      driftAngle: rand(0, Math.PI * 2),
      driftSpeed: rand(0.003, 0.01) * params.speed,
      ySwaySpeed: rand(0.15, 0.35),
      ySwayAmt: rand(0.3, 0.8),
      rollSpeed: rand(-0.012, 0.012) * params.speed,
      breathPeriod: rand(12, 30),
      breathPhase: rand(0, Math.PI * 2),
      baseOpacity,
    };
  }

  #tick() {
    if (!this.sharedMaterial || !camera.instance) return;

    const elapsed = performance.now() / 1000 - this.startTime;
    const params = SKY_PARAMS;
    const camPos = camera.instance.position;

    for (const puff of this.puffs) {
      // ── Gentle drift ──
      const dynamicAngle =
        puff.driftAngle + Math.sin(elapsed * 0.1 + puff.breathPhase) * 0.3;
      const driftDist = puff.driftSpeed * (1 / 60);
      puff.baseX += Math.cos(dynamicAngle) * driftDist;
      puff.baseZ += Math.sin(dynamicAngle) * driftDist;

      // ── Nearest cluster centre ──
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

      // ── Border fade ──
      let borderFade = 1.0;
      if (dist > this.driftRadius * 0.6) {
        const t = Math.max(0, Math.min(1, (dist - this.driftRadius * 0.6) / (this.driftRadius * 0.4)));
        borderFade = 1.0 - t * t * (3.0 - 2.0 * t);
      }

      // ── Respawn near cluster ──
      if (dist >= this.driftRadius) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0, this.driftRadius * 0.2);
        puff.baseX = nearest.x + Math.cos(a) * r;
        puff.baseZ = nearest.z + Math.sin(a) * r;
        puff.baseY = nearest.y + rand(-1.5, 1.5);
        puff.driftAngle = rand(0, Math.PI * 2);
        borderFade = 0.0;
      }

      // ── Slow vertical sway ──
      const currentY =
        puff.baseY +
        Math.sin(elapsed * puff.ySwaySpeed + puff.breathPhase) * puff.ySwayAmt;

      // ── Breathing opacity ──
      const breath =
        Math.sin((elapsed / puff.breathPeriod) * Math.PI * 2 + puff.breathPhase) * 0.2;
      const finalOpacity = Math.max(
        0.01,
        (puff.baseOpacity + breath * puff.baseOpacity) * borderFade * params.opacity,
      );

      // ── Slow roll ──
      puff.mesh.rotation.z += puff.rollSpeed * (1 / 60);

      // ── Apply position + billboard ──
      puff.mesh.position.set(puff.baseX, currentY, puff.baseZ);
      if (camPos) puff.mesh.lookAt(camPos);

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

export const skyClouds = new SkyClouds();
