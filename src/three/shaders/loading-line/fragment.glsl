varying vec2 vUv;
uniform float uScaleY;
uniform float uGlow;

void main() {
    float distFromCenter = abs(vUv.y - 0.5) * 2.0;
    float visible = 1.0 - step(uScaleY, distFromCenter);

    float hDist = abs(vUv.x - 0.5) * 20.0;
    float core = exp(-hDist * 80.0);
    float glow = exp(-hDist * 10.0) * uGlow * 0.6;

    float alpha = visible * (core + glow);
    vec3 color = mix(vec3(1.0), vec3(0.65, 0.75, 1.0), uGlow * 0.6);

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
}
