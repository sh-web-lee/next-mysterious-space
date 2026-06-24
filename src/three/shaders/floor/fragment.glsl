precision highp float;

uniform sampler2D uTexture;
uniform vec3 uCameraPosition;
varying vec3 vWorldPosition;

// ── Simple hash ──────────────────────────────────────
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Rotate a 2D vector by `angle` radians
vec2 rotate2D(vec2 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

// Sample texture with optional rotation and mirroring.
// Replaces the old SAMPLE macro for better GPU compiler compatibility.
// Uses float flags instead of bool for Apple Metal GLSL compiler compatibility.
vec4 sampleTex(vec2 uv, float angle, float mx, float my) {
  vec2 texUV = uv;
  if (mx > 0.5) texUV.x = -texUV.x;
  if (my > 0.5) texUV.y = -texUV.y;
  texUV = rotate2D(texUV, angle);
  return texture2D(uTexture, texUV);
}

void main() {
  // ── Macro-cell setup ───────────────────────────────
  // Large cells that each get their own random rotation / mirror,
  // completely breaking the visible texture repetition.
  float macroScale = 0.08; // ~12.5 world units per macro cell
  vec2 macroUV = vWorldPosition.xz * macroScale;
  vec2 macroCell = floor(macroUV);
  vec2 macroFrac = fract(macroUV);

  // Smoothstep for seamless cell-boundary blending
  vec2 blend = macroFrac * macroFrac * (3.0 - 2.0 * macroFrac);

  // Per-cell random angle (0, 90, 180, 270 degrees) + small jitter
  float texScale = 1.6;
  vec2 baseUV = vWorldPosition.xz * texScale;

  // Helper: quarter-turn step + jitter to break alignment even when rotations match
  float a00 = floor(hash(macroCell + vec2(0.0, 0.0)) * 4.0) * 1.570796 + (hash(macroCell - vec2(0.0, 0.0)) - 0.5) * 0.35;
  float a10 = floor(hash(macroCell + vec2(1.0, 0.0)) * 4.0) * 1.570796 + (hash(macroCell - vec2(1.0, 0.0)) - 0.5) * 0.35;
  float a01 = floor(hash(macroCell + vec2(0.0, 1.0)) * 4.0) * 1.570796 + (hash(macroCell - vec2(0.0, 1.0)) - 0.5) * 0.35;
  float a11 = floor(hash(macroCell + vec2(1.0, 1.0)) * 4.0) * 1.570796 + (hash(macroCell - vec2(1.0, 1.0)) - 0.5) * 0.35;

  // Per-cell mirror flags
  bool mx00 = hash(macroCell + vec2(0.5, 0.0)) > 0.5;
  bool my00 = hash(macroCell + vec2(0.0, 0.5)) > 0.5;
  bool mx10 = hash(macroCell + vec2(1.5, 0.0)) > 0.5;
  bool my10 = hash(macroCell + vec2(1.0, 0.5)) > 0.5;
  bool mx01 = hash(macroCell + vec2(0.5, 1.0)) > 0.5;
  bool my01 = hash(macroCell + vec2(0.0, 1.5)) > 0.5;
  bool mx11 = hash(macroCell + vec2(1.5, 1.0)) > 0.5;
  bool my11 = hash(macroCell + vec2(1.0, 1.5)) > 0.5;

  vec4 s00 = sampleTex(baseUV, a00, mx00 ? 1.0 : 0.0, my00 ? 1.0 : 0.0);
  vec4 s10 = sampleTex(baseUV, a10, mx10 ? 1.0 : 0.0, my10 ? 1.0 : 0.0);
  vec4 s01 = sampleTex(baseUV, a01, mx01 ? 1.0 : 0.0, my01 ? 1.0 : 0.0);
  vec4 s11 = sampleTex(baseUV, a11, mx11 ? 1.0 : 0.0, my11 ? 1.0 : 0.0);

  // Bilinear blend across macro-cell boundaries
  vec4 texColor = mix(mix(s00, s10, blend.x), mix(s01, s11, blend.x), blend.y);

  // ── 3D distance from camera — drives atmospheric perspective
  float dist = length(vWorldPosition - uCameraPosition);

  // Exponential fog: natural atmospheric falloff
  float fogDensity = 0.015;
  float fogFactor = 1.0 - exp(-dist * fogDensity);

  // Keep the near field crisp (no fog within the first few meters)
  float nearClarity = smoothstep(8.0, 18.0, dist);
  fogFactor *= nearClarity;

  // Atmospheric horizon colour — dark blue-gray, matches the HDR sky at the horizon
  vec3 atmosColor = vec3(0.08, 0.10, 0.16);

  // Aerial perspective: distant ground takes on the atmosphere colour,
  // then fades to transparent so the actual HDR sky shows through.
  vec3 color = mix(texColor.rgb, atmosColor, fogFactor);

  // Alpha fade: opaque near camera, transparent at horizon.
  // Use horizontal distance so the fade-out is uniform regardless of camera height,
  // preventing a circular "sphere" illusion when looking down from above.
  float horizDist = length(vWorldPosition.xz - uCameraPosition.xz);
  float alphaFadeStart = 40.0;
  float alphaFadeEnd   = 120.0;
  float alpha = 1.0 - smoothstep(alphaFadeStart, alphaFadeEnd, horizDist);

  // Also apply the exponential fog to alpha for a softer falloff
  float alphaFog = 1.0 - smoothstep(0.0, 1.0, fogFactor * 1.2);
  alpha = min(alpha, alphaFog);

  gl_FragColor = vec4(color, alpha);
}
