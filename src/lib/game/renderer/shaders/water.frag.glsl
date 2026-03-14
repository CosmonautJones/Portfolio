#version 300 es
precision highp float;

in vec2 v_uv;

uniform sampler2D u_scene;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_waterLanes[16]; // y-ranges as pairs: [screenYMin, screenYMax, ...]
uniform int u_waterLaneCount;   // number of water lane pairs

out vec4 fragColor;

void main() {
  vec2 uv = v_uv;
  vec2 pixelPos = uv * u_resolution;

  bool inWater = false;
  for (int i = 0; i < 16; i += 2) {
    if (i >= u_waterLaneCount * 2) break;
    float yMin = u_waterLanes[i];
    float yMax = u_waterLanes[i + 1];
    if (pixelPos.y >= yMin && pixelPos.y <= yMax) {
      inWater = true;
      break;
    }
  }

  if (inWater) {
    // UV distortion
    vec2 distortedUv = uv;
    distortedUv.x += sin(uv.y * 15.0 + u_time * 2.0) * 0.003;

    vec3 color = texture(u_scene, distortedUv).rgb;

    // Specular ripple highlights
    float ripple = pow(max(0.0, sin(uv.x * 30.0 + u_time * 3.0)), 16.0) * 0.15;
    color += vec3(ripple);

    fragColor = vec4(color, 1.0);
  } else {
    // Non-water pixels: pass through
    fragColor = texture(u_scene, uv);
  }
}
