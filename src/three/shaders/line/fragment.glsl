uniform vec2 u_resolution;
uniform float u_css_width; // CSS-pixel viewport width — for DPR-agnostic line sizing
uniform float u_progress;  // 0 → 1, vertical line extension
uniform float u_glow;      // 0 → 1, glow bloom around the line
uniform float u_gate;      // 0 → 1, door opening → blinding light → white flash
uniform float u_time;      // elapsed seconds, drives ray animation

// ── Pseudo-random hash and 2D smooth value noise ──
float hash(float n) { return fract(sin(n) * 43758.5453123); }

float noise(in vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0;
    return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
               mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  // Pixel-snapped center for stable line positioning
  float centerPixel = round(u_resolution.x * 0.5 - 0.5) + 0.5;
  float centerX = centerPixel / u_resolution.x;

  float lineWidth = 0.5 / u_css_width;          // 1 CSS px
  float distanceToCenter = abs(st.x - centerX);

  float centerY = 0.5;
  float halfHeight = u_progress * 0.5;
  bool withinHeight = abs(st.y - centerY) <= halfHeight;

  // ── Glow: soft bloom around the line ──
  float glowWidth = 30.0 / u_css_width;
  float glowFalloff = exp(-distanceToCenter / (glowWidth * 0.3));
  float glow = glowFalloff * float(withinHeight) * u_glow;

  // ── Door Opening: center splits → blinding light pours through ──
  // Inspired by PortalLoading.vue — the gate is a widening central slit
  // that reveals intense hot-white light, with rays bursting from the edges.
  float doorLight = 0.0;
  float doorBloom = 0.0;
  float doorRays  = 0.0;

  if (u_gate > 0.0) {
    // Centered, aspect-corrected UV for angular calculations
    vec2 rayUv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    float absX = abs(rayUv.x);

    // ── Door gap: the widening central slit ──
    // softEdge grows with u_gate → the door edge blurs more as it opens
    // wider, simulating intense light bloom washing out the boundary.
    float doorHalfWidth = u_gate * 0.55;
    float softEdge = (8.0 + u_gate * 70.0) / u_css_width;
    float insideDoor = smoothstep(0.0, softEdge, doorHalfWidth - distanceToCenter);
    insideDoor *= float(withinHeight);

    // ── Door-edge bloom: radiant glow expanding as door opens ──
    float edgeDist = max(0.0, distanceToCenter - doorHalfWidth);
    // Bloom spread widens with u_gate (exponent shrinks → bloom reaches further)
    float bloomSpread = 0.10 - u_gate * 0.07;
    doorBloom = exp(-edgeDist * u_css_width * bloomSpread) * u_gate * float(withinHeight) * 1.2;

    // ── Rays bursting from the door crack ──
    float rayAngle = atan(rayUv.y, rayUv.x * 0.20);

    // Lower frequencies → thicker, more dramatic beams
    float r1 = noise(vec2(rayAngle * 2.5,  u_time * 1.35));
    float r2 = noise(vec2(rayAngle * 8.0 - u_time * 3.2, u_time * 0.4));
    float r3 = noise(vec2(rayAngle * 20.0 + u_time * 5.5, 0.0));
    float combined = r1 * 0.48 + r2 * 0.36 + r3 * 0.16;
    // Wider acceptance → thicker beams with softer edges
    combined = smoothstep(0.15, 0.85, combined);

    // Broad ambient glow behind structured rays
    float broadGlow = noise(vec2(rayAngle * 2.0, u_time * 0.7));
    broadGlow = smoothstep(0.05, 0.95, broadGlow) * 0.5;
    combined += broadGlow;

    // Horizontal fade
    float rayFade = exp(-absX * 1.2);

    // Rays + door intensity scale up together
    doorRays = combined * rayFade * u_gate * float(withinHeight) * 2.2;

    // ── Assemble door light ──
    doorLight = insideDoor + doorBloom + doorRays * 0.75;

    // Glow fades as door overwhelms it
    glow *= (1.0 - u_gate * 0.95);
  }

  // Core line: fades out as door opens
  float coreLine = (distanceToCenter < lineWidth && withinHeight ? 1.0 : 0.0)
                 * (1.0 - u_gate * 0.95);

  // Background: near-black (0x070707)
  vec3 bg = vec3(0.027, 0.027, 0.027);

  // Light colour: slight blue-white tint
  vec3 lightColor = vec3(0.95, 0.98, 1.0);

  vec3 color = bg
    + coreLine * lightColor
    + glow * lightColor
    + doorLight * lightColor;

  // ── Final flash: screen goes pure white when door is fully open ──
  float flash = smoothstep(0.85, 0.98, u_gate);
  color = mix(color, vec3(1.0), flash);

  gl_FragColor = vec4(color, 1.0);
}
