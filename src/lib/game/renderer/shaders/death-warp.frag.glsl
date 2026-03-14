#version 300 es
precision highp float;

in vec2 v_uv;

uniform sampler2D u_scene;
uniform float u_progress;     // 0→1 over death animation
uniform vec2 u_deathCenter;   // normalized UV of death position
uniform vec2 u_resolution;

out vec4 fragColor;

void main() {
  vec2 uv = v_uv;

  // Radial UV warp toward death center
  vec2 dir = uv - u_deathCenter;
  float dist = length(dir);
  if (dist > 0.001) {
    uv += normalize(dir) * u_progress * 0.05;
  }

  // Chromatic aberration — R/G/B at slightly offset UVs
  float spread = u_progress * 0.004;
  float r = texture(u_scene, uv + vec2(spread, 0.0)).r;
  float g = texture(u_scene, uv).g;
  float b = texture(u_scene, uv - vec2(spread, 0.0)).b;
  vec3 color = vec3(r, g, b);

  // Desaturation
  vec3 luminance = vec3(0.2126, 0.7152, 0.0722);
  float gray = dot(color, luminance);
  color = mix(color, vec3(gray), u_progress * 0.6);

  fragColor = vec4(color, 1.0);
}
