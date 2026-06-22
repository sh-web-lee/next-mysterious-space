varying vec2 vUv;
varying vec2 vLocalPos;

#include <clipping_planes_pars_vertex>

void main() {
    vUv = uv;
    vLocalPos = position.xy;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    #include <clipping_planes_vertex>
}
