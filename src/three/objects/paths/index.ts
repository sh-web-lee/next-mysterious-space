import { BoxGeometry, Mesh, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, ShaderMaterial, Texture } from "three";
import { sceneGroup } from "@/three/core/group";
import { loadSources } from "@/utils/loadsources";
import vertexShader from "@/three/shaders/paths/vertex.glsl";
import fragmentShader from "@/three/shaders/paths/fragment.glsl";

const DIRECTIONS = [0];

// ── Dimensions ────────────────────────────────────
const PATH_WIDTH = 0.4;
const PATH_LENGTH = 3000;
const INNER_RADIUS = 1.54; // small gap at the centre
const PATH_Y = 0.01; // above floor to avoid z-fighting

// Step strip dimensions (per-level)
const STEP_RISE = 0.04; // vertical rise of one step
const STEP_TREAD = 0.14; // horizontal depth of one step
const STEP_LEVELS = 1; // single-step rise on each side

interface PathGroup {
  surface: Mesh;
  geom: PlaneGeometry;
  stepsL: Mesh[];
  stepsR: Mesh[];
}

class Paths {
  private groups: PathGroup[] = [];
  private stepBoxGeom: BoxGeometry | null = null;
  private stepMat: MeshStandardMaterial | null = null;

  init() {
    const stepTexture = loadSources.items["step-texture"] as Texture;
    if (stepTexture) {
      stepTexture.wrapS = RepeatWrapping;
      stepTexture.wrapT = RepeatWrapping;
    }

    this.stepBoxGeom = new BoxGeometry(STEP_TREAD, STEP_RISE, PATH_LENGTH);

    // Fix UVs so the texture tiles correctly across the 3000-unit length.
    // Default UVs span [0,1] over the entire face — massively stretched.
    // BoxGeometry face order: +X(0-3) -X(4-7) +Y(8-11) -Y(12-15) +Z(16-19) -Z(20-23)
    const uv = this.stepBoxGeom.attributes.uv;
    // Tile every ~1 world unit along the length. Scale width-coordinate so
    // each tile uses a ~0.14-wide strip of the texture (matching the tread width).
    for (let i = 0; i < 8; i++) {
      // ±X faces: U=Z(length) V=Y(height) → scale U
      uv.setXY(i, uv.getX(i) * PATH_LENGTH, uv.getY(i));
    }
    for (let i = 8; i < 16; i++) {
      // ±Y faces: U=X(width) V=Z(length) → scale U by 0.7 (use 70% of tex width), V by length
      uv.setXY(i, uv.getX(i) * 0.7, uv.getY(i) * PATH_LENGTH);
    }

    this.stepMat = new MeshStandardMaterial({
      map: stepTexture || undefined,
      color: stepTexture ? 0xffffff : 0x333333,
      roughness: 0.6,
      metalness: 0.02,
    });

    const centreOffset = INNER_RADIUS + PATH_LENGTH / 2;
    const halfPW = PATH_WIDTH / 2;

    for (const angle of DIRECTIONS) {
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      // ── Each path gets its own geometry + material ──
      const geom = new PlaneGeometry(PATH_WIDTH, PATH_LENGTH);

      const mat = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTextureDark: { value: stepTexture || null },
        },
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        depthWrite: false,
        clipping: true,
        clipShadows: true,
      });

      // ── Path surface ────────────────────────────
      const surface = new Mesh(geom, mat);
      surface.renderOrder = 0;
      surface.rotation.x = -Math.PI / 2;
      surface.rotation.y = angle;
      surface.position.set(sinA * centreOffset, PATH_Y, cosA * centreOffset);

      // ── Stepped sides ───────────────────────────
      const stepsL: Mesh[] = [];
      const stepsR: Mesh[] = [];

      for (let level = 0; level < STEP_LEVELS; level++) {
        const rise = STEP_RISE * (level + 1); // cumulative rise height
        const acrossOffset = halfPW + STEP_TREAD * (level + 0.5); // centre of this tread

        // Left step
        const sl = new Mesh(this.stepBoxGeom!, this.stepMat!);
        sl.renderOrder = 0;
        sl.rotation.y = angle; // align long axis with path
        sl.position.set(sinA * centreOffset, PATH_Y + rise - STEP_RISE / 2, cosA * centreOffset);
        sl.translateX(-acrossOffset);
        stepsL.push(sl);

        // Right step
        const sr = new Mesh(this.stepBoxGeom!, this.stepMat!);
        sr.renderOrder = 0;
        sr.rotation.y = angle;
        sr.position.set(sinA * centreOffset, PATH_Y + rise - STEP_RISE / 2, cosA * centreOffset);
        sr.translateX(acrossOffset);
        stepsR.push(sr);
      }

      sceneGroup.instance.add(surface);
      stepsL.forEach((s) => sceneGroup.instance.add(s));
      stepsR.forEach((s) => sceneGroup.instance.add(s));

      this.groups.push({ surface, geom, stepsL, stepsR });
    }
  }

  destroy() {
    for (const g of this.groups) {
      sceneGroup.instance.remove(g.surface);
      g.stepsL.forEach((s) => sceneGroup.instance.remove(s));
      g.stepsR.forEach((s) => sceneGroup.instance.remove(s));
      g.geom.dispose();
      (g.surface.material as ShaderMaterial).dispose();
    }
    this.groups = [];
    this.stepBoxGeom?.dispose();
    this.stepBoxGeom = null;
    this.stepMat?.dispose();
    this.stepMat = null;
  }
}

export const paths = new Paths();
