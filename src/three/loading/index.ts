import * as THREE from "three";
import gsap from "gsap";
import sizes from "@/utils/Sizes";
import vertexShader from "@/three/shaders/line/vertex.glsl";
import fragmentShader from "@/three/shaders/line/fragment.glsl";
import EventEmitter from "@/utils/EventEmitter";

/**
 * Animation phase state machine for the portal loading sequence.
 *
 * Flow: idle → line-extending → glowing → door-opening → scenes-merging → complete
 */
export type AnimationPhase =
  | "idle" // Initial state, nothing visible yet
  | "line-extending" // Vertical line grows from center toward top & bottom
  | "glowing" // Glow flare blooms around the line
  | "door-opening" // Gate widens horizontally, volumetric rays burst out
  | "scenes-merging"; // Shader overlay fades out, 3D scene fades in

class PortalLoading extends EventEmitter<{ complete: void }> {
  /** The target HTML canvas element this renderer draws onto. */
  private _canvas: HTMLCanvasElement | null = null;

  /** Scene holding the fullscreen shader quad. */
  private _scene: THREE.Scene;

  /**
   * Orthographic camera for 2D screen-space rendering.
   * Fixed [-1, 1] frustum — the 2×2 PlaneGeometry always fills it
   * regardless of screen aspect ratio.
   */
  private _camera: THREE.OrthographicCamera;

  /** WebGL renderer instance — created in `init()`, disposed in `destroy()`. */
  private _instance: THREE.WebGLRenderer | null = null;

  /** Current phase of the loading animation state machine. */
  phase: AnimationPhase = "idle";

  private _lineMaterial: THREE.ShaderMaterial | null = null;

  constructor() {
    super(); // EventEmitter — enables `portalLoading.on("complete", callback)`
    this._scene = new THREE.Scene();

    // Square ortho frustum [-1, 1] — the 2×2 PlaneGeometry fills it exactly
    // regardless of screen aspect ratio. The shader uses gl_FragCoord /
    // u_resolution for UVs, so it's natively aspect-ratio aware.
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this._camera.position.z = 10;
  }

  /**
   * Bootstraps the WebGL renderer onto the provided canvas element.
   *
   * - Creates a `WebGLRenderer` with the given canvas (no auto-append to DOM).
   * - Sets a near-black clear color so the shader's black pixels blend naturally.
   * - Caps pixel ratio at 2x to balance sharpness and performance.
   * - Registers the render tick on GSAP's ticker (project convention).
   * - Subscribes to `Sizes.resize` events for responsive updates.
   *
   * @param canvas - The HTML canvas element to bind the renderer to.
   */
  private _tickerRegistered = false;

  init(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this._canvas = canvas;

    this._initRenderer();

    // Only register ticker + resize once (prevents duplicates on Strict Mode remount)
    if (!this._tickerRegistered) {
      this._tickerRegistered = true;
      // Use GSAP ticker instead of requestAnimationFrame (follows project convention).
      // _tick is an arrow function — `this` is already lexically bound, no .bind() needed.
      gsap.ticker.add(this._tick);
      // Keep the camera frustum in sync with window size changes.
      sizes.on("resize", this.resize);
    }
    this.resize();
  }

  _initRenderer() {
    this._instance = new THREE.WebGLRenderer({
      canvas: this._canvas!,
      antialias: true,
      alpha: false, // Opaque background — shader handles its own black pixels.
    });

    // Near-black background to match the "mysterious space" aesthetic.
    this._instance.setClearColor(0x070707, 1);

    // Clamp pixel ratio to avoid paying for 3x/4x on high-DPI mobile screens.
    this._instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Creates the fullscreen shader quad and starts the GSAP-driven animation.
   *
   * ## Shader behavior (see fragment.glsl)
   * - `u_progress` drives a vertical line that extends from the screen center
   *   toward the top and bottom edges (0 = invisible, 1 = full height).
   * - The line is thin (`lineWidth = 0.002` in UV space) with a crisp
   *   binary cutoff — white inside the line, transparent black outside.
   *
   * ## Animation
   * - Duration: 2 seconds with `power2.inOut` easing (gentle start & end).
   * - Each frame, `onUpdate` manually triggers a render so the shader updates
   *   are visible immediately rather than waiting for the next ticker cycle.
   */
  setupLineMaterial() {
    // Fullscreen quad: 2x2 in local space, fills the ortho frustum exactly.
    const geometry = new THREE.PlaneGeometry(2, 2);

    this._lineMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        // Screen resolution in drawing-buffer pixels — must account for pixelRatio
        // because gl_FragCoord operates in physical pixels, not CSS pixels.
        u_resolution: {
          value: new THREE.Vector2(
            window.innerWidth * Math.min(window.devicePixelRatio, 2),
            window.innerHeight * Math.min(window.devicePixelRatio, 2)
          ),
        },
        // CSS-pixel viewport width — used for DPR-agnostic line-width calculation.
        u_css_width: { value: window.innerWidth },
        // Animation progress from 0 (no line) to 1 (line spans full screen height).
        u_progress: { value: 0 },
        // Glow bloom intensity — 0 = off, 1 = full glow. Animated after line extension.
        u_glow: { value: 0 },
        // Ray burst intensity — 0 = off, 1 = full rays. Animated after glow completes.
        u_rays: { value: 0 },
        // Gate expansion — 0 = thin line, 1 = fills screen → white flash.
        u_gate: { value: 0 },
        // Elapsed time in seconds — drives ray animation (shimmer / slot cycling).
        u_time: { value: 0 },
      },
    });

    const mesh = new THREE.Mesh(geometry, this._lineMaterial);
    this._scene?.add(mesh);

    // Animate u_progress from 0 to 1 over 2 seconds.
    // onUpdate renders on every GSAP tick so the animation is smooth.

    this.playAnimation();
  }

  playAnimation() {
    if (!this._lineMaterial) return;

    const tl = gsap.timeline({
      onComplete: () => this.emit("complete"),
    });

    // Phase 1: vertical line extends from center → full height (2s)
    tl.to(this._lineMaterial.uniforms.u_progress, { value: 1, duration: 2, ease: "power2.inOut" }, "+=0.3");

    // Phase 2: glow blooms around the fully-extended line (1.5s)
    tl.to(this._lineMaterial.uniforms.u_glow, { value: 1, duration: 0.3, ease: "power2.out" }, "-=0.3");

    // Phase 3: door opens — center splits, blinding light with rays bursts through (3s)
    tl.to(this._lineMaterial.uniforms.u_gate, { value: 1, duration: 3, ease: "power3.in" }, "-=0.5");
  }

  /**
   * Resize handler — called on window resize via the Sizes event bus.
   *
   * Updates the renderer size, pixel ratio, and orthographic camera frustum
   * so the shader quad always fills the viewport without distortion.
   *
   * Uses an arrow function to preserve `this` binding when passed as a callback.
   */
  resize = () => {
    if (!this._instance) return;

    // Update renderer to match the new viewport dimensions.
    // `false` = don't reset the CSS size (handled by the Sizes singleton).
    this._instance.setSize(sizes.width, sizes.height, false);
    this._instance.setPixelRatio(sizes.pixelRatio);

    // Keep shader uniforms in sync with new viewport size.
    if (this._lineMaterial) {
      this._lineMaterial.uniforms.u_resolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);
      this._lineMaterial.uniforms.u_css_width.value = sizes.width;
    }

    // Camera frustum is fixed at [-1, 1] — no aspect-ratio adjustment needed.
  };

  /**
   * Per-frame render callback invoked by GSAP's ticker.
   *
   * Renders the shader scene to the canvas. Called at GSAP's native frame rate
   * (typically 60fps, synchronized with rAF internally by GSAP).
   */
  private _tick = (): void => {
    if (!this._instance) return;
    // Advance shader time for ray animation (shimmer / slot cycling)
    if (this._lineMaterial) {
      this._lineMaterial.uniforms.u_time.value = performance.now() * 0.001;
    }
    this._instance.render(this._scene, this._camera);
  };

  /**
   * Tears down the loading animation and releases all resources.
   *
   * - Removes the render tick from GSAP's ticker.
   * - Unsubscribes from Sizes resize events.
   * - Disposes the WebGL renderer (releases GPU context, buffers, shaders).
   *
   * Call this when the loading screen is no longer needed (e.g., after
   * the scene transition completes) to prevent memory leaks.
   */
  destroy() {
    gsap.ticker.remove(this._tick);
    sizes.off("resize", this.resize);
    this._instance?.dispose();
    this._tickerRegistered = false;
  }
}

/** Singleton instance — follows the project's single-instance pattern. */
export const portalLoading = new PortalLoading();
