#include <clipping_planes_pars_fragment>

varying vec2 vUv;
varying vec2 vLocalPos;

uniform sampler2D uTextureDark;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    // ── Square checkerboard ──────────────────────────
    // 14 tiles across the width (0.4 world units).
    // Same tile size along the length → truly square tiles.
    float tileSize = 0.4 / 14.0;
    vec2 grid = floor(vLocalPos / tileSize);
    float checker = mod(grid.x + grid.y, 2.0);

    // ── UV within the current tile ────────────────────
    vec2 tileUV = fract(vLocalPos / tileSize);

    // ── Dark tile: sample step.webp texture ──────────
    vec4 darkColor = texture2D(uTextureDark, tileUV);

    // ── Light tile: procedural aged stone floor ───────
    // Base — worn limestone / old marble, slightly warm
    vec3 lightBase = vec3(0.77, 0.75, 0.72);

    // Per-tile subtle hue drift (age unevenness)
    float tileHash = hash(grid);
    lightBase += (tileHash - 0.5) * 0.05;

    // Multi-scale stone grain
    float g1 = hash(tileUV * 60.0) - 0.5;
    float g2 = hash(tileUV * 140.0 + 0.3) - 0.5;
    float g3 = hash(tileUV * 30.0 + vec2(0.7, 0.2)) - 0.5;
    float grain = g1 * 0.04 + g2 * 0.025 + g3 * 0.035;
    vec3 lightColor = lightBase + grain;

    // Subtle aggregate speckles
    float speckleHash = hash(tileUV * 55.0 + 0.5);
    float speckle = smoothstep(0.83, 0.89, speckleHash) * 0.05;
    lightColor -= speckle;

    // Faint veins / mineral streaks
    float vein = smoothstep(0.93, 0.97, hash(tileUV * 130.0 + 1.0)) * 0.025;
    float vein2 = smoothstep(0.05, 0.08, hash(tileUV * 190.0 - 0.6)) * 0.018;
    lightColor -= vein + vein2;

    // Subtle scuff marks
    float scuff = hash(tileUV * 210.0 + 2.0);
    float scuffMark = smoothstep(0.94, 0.975, scuff);
    lightColor -= scuffMark * 0.03;

    // Dirt settling in micro-crevices
    float dirt = hash(tileUV * 85.0 - 1.7);
    float dirtSpot = smoothstep(0.86, 0.90, dirt);
    lightColor -= dirtSpot * 0.035;

    // Fine surface grain
    float fine = (hash(tileUV * 450.0 + 3.0) - 0.5) * 0.015;
    lightColor += fine;

    vec4 lightResult = vec4(lightColor, 1.0);

    // ── Combine ──────────────────────────────────────
    vec4 color = mix(lightResult, darkColor, checker);
    gl_FragColor = color;

    #include <clipping_planes_fragment>
}
