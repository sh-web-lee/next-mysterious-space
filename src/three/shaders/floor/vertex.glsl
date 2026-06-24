precision highp float;

varying vec3 vWorldPosition;

void main() {
  // Floor is PlaneGeometry(3000, 3000) in XY plane, rotated -PI/2 around X.
  // Local position.xy ranges [-1500, 1500], local Z is always 0.
  // After rotation: world X = local X, world Y = 0, world Z = -local Y.
  // Mesh position.y = 0.01 lifts it just above the clipping plane.
  // Hardcoded transform avoids ALL matrix-uniform compatibility issues
  // (especially on macOS/Metal where Three.js built-in uniforms may differ).
  vWorldPosition = vec3(position.x, 0.01, -position.y);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
