#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_bloomIntensity;
uniform float u_time;
uniform vec2 u_resolution;

out vec4 fragColor;

void main() {
  vec2 uv = v_uv;

  // Direct scene sample — no chromatic aberration
  vec3 scene = texture(u_scene, uv).rgb;

  // Add bloom (static intensity, no breathing)
  vec3 bloom = texture(u_bloom, uv).rgb;
  scene += bloom * u_bloomIntensity;

  // Vignette — static subtle dark corners (alpha ~0.15)
  float vigDist = length(uv - 0.5) * 1.4;
  float vig = smoothstep(0.4, 0.9, vigDist);
  scene *= 1.0 - vig * 0.15;

  // Scanline hint — very subtle for retro feel
  float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.02 + 1.0;
  scene *= scanline;

  fragColor = vec4(scene, 1.0);
}
